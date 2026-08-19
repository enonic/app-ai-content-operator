package com.enonic.app.ai.contentoperator.image;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Base64;
import java.util.Iterator;

import javax.imageio.ImageIO;
import javax.imageio.ImageReadParam;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

import com.github.weisj.jsvg.SVGDocument;
import com.github.weisj.jsvg.parser.LoaderContext;
import com.github.weisj.jsvg.parser.SVGLoader;
import com.github.weisj.jsvg.parser.resources.ResourcePolicy;
import com.github.weisj.jsvg.view.FloatSize;
import com.github.weisj.jsvg.view.ViewBox;

public class ImageDownscaler {

    private static final long DOWNSCALE_THRESHOLD_BYTES = 1024L * 1024;

    private static final long MAX_SOURCE_BYTES = 15L * 1024 * 1024;

    private static final int MAX_DIMENSION = 1024;

    private String mimeType;

    private String data;

    private static boolean isSvg(final String mimeType) {
        if (mimeType == null) {
            return false;
        }
        final int paramsIndex = mimeType.indexOf(';');
        final String baseType = (paramsIndex >= 0 ? mimeType.substring(0, paramsIndex) : mimeType).trim();
        return "image/svg+xml".equalsIgnoreCase(baseType);
    }

    private static byte[] rasterizeSvgToJpeg(final byte[] source) {
        try {
            final LoaderContext context = LoaderContext.builder()
                .externalResourcePolicy(ResourcePolicy.DENY_EXTERNAL)
                .build();
            final SVGDocument document = new SVGLoader().load(new ByteArrayInputStream(source), null, context);
            if (document == null) {
                return null;
            }
            final ByteArrayOutputStream out = new ByteArrayOutputStream();
            if (!ImageIO.write(renderToFit(document), "jpeg", out)) {
                return null;
            }
            return out.toByteArray();
        } catch (IOException | RuntimeException e) {
            return null;
        }
    }

    private static BufferedImage renderToFit(final SVGDocument document) {
        final FloatSize size = document.size();
        final int width;
        final int height;
        if (Float.isFinite(size.width) && Float.isFinite(size.height) && size.width >= 1 && size.height >= 1) {
            final double scale = Math.min(1.0, MAX_DIMENSION / (double) Math.max(size.width, size.height));
            width = Math.max(1, (int) Math.round(size.width * scale));
            height = Math.max(1, (int) Math.round(size.height * scale));
        } else {
            width = MAX_DIMENSION;
            height = MAX_DIMENSION;
        }

        final BufferedImage target = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        final Graphics2D graphics = target.createGraphics();
        try {
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, width, height);
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            document.render(null, graphics, new ViewBox(0, 0, width, height));
        } finally {
            graphics.dispose();
        }
        return target;
    }

    public String getMimeType() {
        return mimeType;
    }

    public String getData() {
        return data;
    }

    public boolean prepare(final InputStream stream, final String sourceMimeType) throws IOException {
        final byte[] source = readCapped(stream);
        if (source == null) {
            return false;
        }
        if (isSvg(sourceMimeType)) {
            // ! The model cannot read raw SVG, so a failed rasterization must skip the image, not pass it through
            final byte[] rasterized = rasterizeSvgToJpeg(source);
            return rasterized != null && storeJpeg(rasterized);
        }
        if (source.length <= DOWNSCALE_THRESHOLD_BYTES) {
            return passthrough(source, sourceMimeType);
        }
        final byte[] scaled = downscaleToJpeg(source);
        if (scaled == null) {
            return passthrough(source, sourceMimeType);
        }
        return storeJpeg(scaled);
    }

    private boolean passthrough(final byte[] source, final String sourceMimeType) {
        this.mimeType = sourceMimeType;
        this.data = Base64.getEncoder().encodeToString(source);
        return true;
    }

    private boolean storeJpeg(final byte[] bytes) {
        this.mimeType = "image/jpeg";
        this.data = Base64.getEncoder().encodeToString(bytes);
        return true;
    }

    private static byte[] readCapped(final InputStream stream) throws IOException {
        try (stream) {
            final ByteArrayOutputStream out = new ByteArrayOutputStream();
            final byte[] buffer = new byte[8192];
            long total = 0;
            int read;
            while ((read = stream.read(buffer)) != -1) {
                total += read;
                if (total > MAX_SOURCE_BYTES) {
                    return null;
                }
                out.write(buffer, 0, read);
            }
            return out.toByteArray();
        }
    }

    private static byte[] downscaleToJpeg(final byte[] source) {
        try {
            final BufferedImage decoded = decodeSubsampled(source);
            if (decoded == null) {
                return null;
            }
            final ByteArrayOutputStream out = new ByteArrayOutputStream();
            if (!ImageIO.write(scaleToFit(decoded), "jpeg", out)) {
                return null;
            }
            return out.toByteArray();
        } catch (IOException | RuntimeException e) {
            return null;
        }
    }

    private static BufferedImage decodeSubsampled(final byte[] source) throws IOException {
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(source))) {
            final Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) {
                return null;
            }
            final ImageReader reader = readers.next();
            try {
                reader.setInput(input, true, true);
                final int longEdge = Math.max(reader.getWidth(0), reader.getHeight(0));
                final int sampling = Math.max(1, longEdge / (MAX_DIMENSION * 2));
                final ImageReadParam param = reader.getDefaultReadParam();
                param.setSourceSubsampling(sampling, sampling, 0, 0);
                return reader.read(0, param);
            } finally {
                reader.dispose();
            }
        }
    }

    private static BufferedImage scaleToFit(final BufferedImage image) {
        final int longEdge = Math.max(image.getWidth(), image.getHeight());
        final double scale = Math.min(1.0, (double) MAX_DIMENSION / longEdge);
        final int width = Math.max(1, (int) Math.round(image.getWidth() * scale));
        final int height = Math.max(1, (int) Math.round(image.getHeight() * scale));

        final BufferedImage target = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        final Graphics2D graphics = target.createGraphics();
        try {
            graphics.setColor(Color.WHITE);
            graphics.fillRect(0, 0, width, height);
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            graphics.drawImage(image, 0, 0, width, height, null);
        } finally {
            graphics.dispose();
        }
        return target;
    }
}
