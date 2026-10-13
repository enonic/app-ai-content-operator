import { describe, expect, it } from 'vitest';

import type { ContentData } from './ContentData';
import type { Schema } from './Schema';
import type { FormJson } from '@enonic/ui-types';

import { getDataPathsToEditableItems, getFormItemsWithPaths, pathToString } from './content.utils';

describe('schemaUtil', () => {
  it('walks the form Content Studio sends, an array of items typed by formItemType', () => {
    const form: FormJson = [
      {
        formItemType: 'Input',
        name: 'title',
        label: 'Title',
        inputType: 'TextLine',
        occurrences: { minimum: 1, maximum: 1 },
      },
      {
        formItemType: 'ItemSet',
        name: 'address',
        label: 'Address',
        occurrences: { minimum: 0, maximum: 1 },
        items: [
          {
            formItemType: 'Input',
            name: 'city',
            label: 'City',
            inputType: 'TextLine',
            occurrences: { minimum: 0, maximum: 1 },
          },
        ],
      },
    ];

    expect(getFormItemsWithPaths(form).map(pathToString)).toEqual([
      '/title',
      '/address',
      '/address/city',
    ]);
  });

  it('skips form fragments and reads option sets without items', () => {
    const form: FormJson = [
      { formItemType: 'FormFragment', name: 'seo' },
      {
        formItemType: 'OptionSet',
        name: 'kind',
        label: 'Kind',
        occurrences: { minimum: 0, maximum: 1 },
        selection: { minimum: 1, maximum: 1 },
        options: [
          { name: 'plain', label: 'Plain', default: true },
          {
            name: 'rich',
            label: 'Rich',
            items: [
              {
                formItemType: 'Input',
                name: 'body',
                label: 'Body',
                inputType: 'HtmlArea',
                occurrences: { minimum: 0, maximum: 1 },
              },
            ],
          },
        ],
      },
    ];

    expect(getFormItemsWithPaths(form).map(pathToString)).toEqual([
      '/kind',
      '/kind/plain',
      '/kind/rich',
      '/kind/rich/body',
    ]);
  });

  it('should return two top items', () => {
    const received = getFormItemsWithPaths(getRootInputsSchema().form);
    const expected = [
      {
        formItemType: 'Input',
        inputType: 'HtmlArea',
        label: 'HtmlArea',
        name: 'myHtmlArea',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        elements: [
          {
            label: 'HtmlArea',
            name: 'myHtmlArea',
          },
        ],
      },
      {
        formItemType: 'Input',
        inputType: 'TextArea',
        label: 'TextArea',
        name: 'myTextArea',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        elements: [
          {
            label: 'TextArea',
            name: 'myTextArea',
          },
        ],
      },
      {
        formItemType: 'Input',
        inputType: 'TextLine',
        label: 'TextLine',
        name: 'myTextLine',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        elements: [
          {
            label: 'TextLine',
            name: 'myTextLine',
          },
        ],
      },
    ];

    expect(received).toEqual(expected);
  });

  it('should return text inputs in fieldset', () => {
    const received = getFormItemsWithPaths(getFieldSetSchema().form);
    const expected = [
      {
        formItemType: 'Input',
        inputType: 'TextArea',
        label: 'TextAreas',
        name: 'myTextAreas',
        occurrences: {
          maximum: 5,
          minimum: 0,
        },
        elements: [
          {
            label: 'TextAreas',
            name: 'myTextAreas',
          },
        ],
      },
    ];

    expect(received).toEqual(expected);
  });

  it('should return all form items from FormOptionSet, including option set itself and options', () => {
    const received = getFormItemsWithPaths(getFormOptionSetSchema().form);
    const expected = [
      {
        formItemType: 'OptionSet',
        selection: { minimum: 0, maximum: 1 },
        label: 'Multi-selection OptionSet',
        name: 'checkOptionSet',
        occurrences: {
          maximum: 1,
          minimum: 1,
        },
        options: [
          {
            items: [],
            label: 'Option 1',
            name: 'option_1',
          },
          {
            items: [
              {
                formItemType: 'Input',
                inputType: 'ContentSelector',
                label: 'Content selector',
                name: 'contentSelector',
                occurrences: {
                  maximum: 0,
                  minimum: 0,
                },
              },
            ],
            label: 'Option 2',
            name: 'option_2',
          },
          {
            items: [
              {
                formItemType: 'Input',
                inputType: 'TextArea',
                label: 'Text Area',
                name: 'textarea',
                occurrences: {
                  maximum: 1,
                  minimum: 0,
                },
              },
              {
                formItemType: 'Input',
                inputType: 'Long',
                label: 'Long',
                name: 'long',
                occurrences: {
                  maximum: 1,
                  minimum: 0,
                },
              },
            ],
            label: 'Option 3',
            name: 'option_3',
          },
        ],
        elements: [
          {
            label: 'Multi-selection OptionSet',
            name: 'checkOptionSet',
          },
        ],
      },
      {
        elements: [
          {
            label: 'Multi-selection OptionSet',
            name: 'checkOptionSet',
          },
          {
            label: 'Option 1',
            name: 'option_1',
          },
        ],
        items: [],
        label: 'Option 1',
        name: 'option_1',
      },
      {
        elements: [
          {
            label: 'Multi-selection OptionSet',
            name: 'checkOptionSet',
          },
          {
            label: 'Option 2',
            name: 'option_2',
          },
        ],
        items: [
          {
            formItemType: 'Input',
            inputType: 'ContentSelector',
            label: 'Content selector',
            name: 'contentSelector',
            occurrences: {
              maximum: 0,
              minimum: 0,
            },
          },
        ],
        label: 'Option 2',
        name: 'option_2',
      },
      {
        elements: [
          {
            label: 'Multi-selection OptionSet',
            name: 'checkOptionSet',
          },
          {
            label: 'Option 3',
            name: 'option_3',
          },
        ],
        items: [
          {
            formItemType: 'Input',
            inputType: 'TextArea',
            label: 'Text Area',
            name: 'textarea',
            occurrences: {
              maximum: 1,
              minimum: 0,
            },
          },
          {
            formItemType: 'Input',
            inputType: 'Long',
            label: 'Long',
            name: 'long',
            occurrences: {
              maximum: 1,
              minimum: 0,
            },
          },
        ],
        label: 'Option 3',
        name: 'option_3',
      },
      {
        formItemType: 'Input',
        inputType: 'TextArea',
        label: 'Text Area',
        name: 'textarea',
        occurrences: {
          maximum: 1,
          minimum: 0,
        },
        elements: [
          {
            label: 'Multi-selection OptionSet',
            name: 'checkOptionSet',
          },
          {
            label: 'Option 3',
            name: 'option_3',
          },
          {
            label: 'Text Area',
            name: 'textarea',
          },
        ],
      },
    ];

    expect(received).toEqual(expected);
  });

  it('should return all text inputs and item sets in entire schema', () => {
    const received = getFormItemsWithPaths(getFullSchema().form);
    const expected = [
      {
        formItemType: 'Input',
        inputType: 'HtmlArea',
        label: 'HtmlArea',
        name: 'myHtmlArea',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        elements: [
          {
            label: 'HtmlArea',
            name: 'myHtmlArea',
          },
        ],
      },
      {
        formItemType: 'Input',
        inputType: 'TextArea',
        label: 'TextArea',
        name: 'myTextArea',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        elements: [
          {
            label: 'TextArea',
            name: 'myTextArea',
          },
        ],
      },
      {
        formItemType: 'Input',
        inputType: 'TextLine',
        label: 'TextLine',
        name: 'myTextLine',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        elements: [
          {
            label: 'TextLine',
            name: 'myTextLine',
          },
        ],
      },
      {
        formItemType: 'Input',
        inputType: 'TextArea',
        label: 'TextAreas',
        name: 'myTextAreas',
        occurrences: {
          maximum: 5,
          minimum: 0,
        },
        elements: [
          {
            label: 'TextAreas',
            name: 'myTextAreas',
          },
        ],
      },
      {
        formItemType: 'ItemSet',
        items: [
          {
            formItemType: 'Input',
            inputType: 'TextLine',
            label: 'TextLine',
            name: 'textLine',
            occurrences: {
              maximum: 1,
              minimum: 0,
            },
          },
          {
            formItemType: 'Input',
            inputType: 'Long',
            label: 'Long',
            name: 'long',
            occurrences: {
              maximum: 1,
              minimum: 0,
            },
          },
        ],
        label: 'ItemSet',
        name: 'myItemSet',
        occurrences: {
          maximum: 5,
          minimum: 0,
        },
        elements: [
          {
            label: 'ItemSet',
            name: 'myItemSet',
          },
        ],
      },
      {
        formItemType: 'Input',
        inputType: 'TextLine',
        label: 'TextLine',
        name: 'textLine',
        occurrences: {
          maximum: 1,
          minimum: 0,
        },
        elements: [
          {
            label: 'ItemSet',
            name: 'myItemSet',
          },
          {
            label: 'TextLine',
            name: 'textLine',
          },
        ],
      },
      {
        formItemType: 'OptionSet',
        selection: { minimum: 0, maximum: 1 },
        label: 'Multi-selection OptionSet',
        name: 'checkOptionSet',
        occurrences: {
          maximum: 1,
          minimum: 1,
        },
        options: [
          {
            items: [],
            label: 'Option 1',
            name: 'option_1',
          },
          {
            items: [
              {
                formItemType: 'Input',
                inputType: 'ContentSelector',
                label: 'Content selector',
                name: 'contentSelector',
                occurrences: {
                  maximum: 0,
                  minimum: 0,
                },
              },
            ],
            label: 'Option 2',
            name: 'option_2',
          },
          {
            items: [
              {
                formItemType: 'Input',
                inputType: 'TextArea',
                label: 'Text Area',
                name: 'textarea',
                occurrences: {
                  maximum: 1,
                  minimum: 0,
                },
              },
              {
                formItemType: 'Input',
                inputType: 'Long',
                label: 'Long',
                name: 'long',
                occurrences: {
                  maximum: 1,
                  minimum: 0,
                },
              },
            ],
            label: 'Option 3',
            name: 'option_3',
          },
        ],
        elements: [
          {
            label: 'Multi-selection OptionSet',
            name: 'checkOptionSet',
          },
        ],
      },
      {
        elements: [
          {
            label: 'Multi-selection OptionSet',
            name: 'checkOptionSet',
          },
          {
            label: 'Option 1',
            name: 'option_1',
          },
        ],
        items: [],
        label: 'Option 1',
        name: 'option_1',
      },
      {
        elements: [
          {
            label: 'Multi-selection OptionSet',
            name: 'checkOptionSet',
          },
          {
            label: 'Option 2',
            name: 'option_2',
          },
        ],
        items: [
          {
            formItemType: 'Input',
            inputType: 'ContentSelector',
            label: 'Content selector',
            name: 'contentSelector',
            occurrences: {
              maximum: 0,
              minimum: 0,
            },
          },
        ],
        label: 'Option 2',
        name: 'option_2',
      },
      {
        elements: [
          {
            label: 'Multi-selection OptionSet',
            name: 'checkOptionSet',
          },
          {
            label: 'Option 3',
            name: 'option_3',
          },
        ],
        items: [
          {
            formItemType: 'Input',
            inputType: 'TextArea',
            label: 'Text Area',
            name: 'textarea',
            occurrences: {
              maximum: 1,
              minimum: 0,
            },
          },
          {
            formItemType: 'Input',
            inputType: 'Long',
            label: 'Long',
            name: 'long',
            occurrences: {
              maximum: 1,
              minimum: 0,
            },
          },
        ],
        label: 'Option 3',
        name: 'option_3',
      },
      {
        formItemType: 'Input',
        inputType: 'TextArea',
        label: 'Text Area',
        name: 'textarea',
        occurrences: {
          maximum: 1,
          minimum: 0,
        },
        elements: [
          {
            label: 'Multi-selection OptionSet',
            name: 'checkOptionSet',
          },
          {
            label: 'Option 3',
            name: 'option_3',
          },
          {
            label: 'Text Area',
            name: 'textarea',
          },
        ],
      },
      {
        formItemType: 'OptionSet',
        selection: { minimum: 0, maximum: 1 },
        label: 'Single-selection OptionSet',
        name: 'radioOptionSet',
        occurrences: {
          maximum: 1,
          minimum: 1,
        },
        options: [
          {
            items: [],
            label: 'Option 1',
            name: 'option_1',
          },
          {
            items: [
              {
                formItemType: 'Input',
                inputType: 'ContentSelector',
                label: 'Content selector',
                name: 'contentSelector',
                occurrences: {
                  maximum: 0,
                  minimum: 0,
                },
              },
            ],
            label: 'Option 2',
            name: 'option_2',
          },
          {
            items: [
              {
                formItemType: 'Input',
                inputType: 'TextArea',
                label: 'Text Area',
                name: 'textarea',
                occurrences: {
                  maximum: 1,
                  minimum: 0,
                },
              },
              {
                formItemType: 'Input',
                inputType: 'Long',
                label: 'Long',
                name: 'long',
                occurrences: {
                  maximum: 1,
                  minimum: 0,
                },
              },
            ],
            label: 'Option 3',
            name: 'option_3',
          },
        ],
        elements: [
          {
            label: 'Single-selection OptionSet',
            name: 'radioOptionSet',
          },
        ],
      },
      {
        elements: [
          {
            label: 'Single-selection OptionSet',
            name: 'radioOptionSet',
          },
          {
            label: 'Option 1',
            name: 'option_1',
          },
        ],
        items: [],
        label: 'Option 1',
        name: 'option_1',
      },
      {
        elements: [
          {
            label: 'Single-selection OptionSet',
            name: 'radioOptionSet',
          },
          {
            label: 'Option 2',
            name: 'option_2',
          },
        ],
        items: [
          {
            formItemType: 'Input',
            inputType: 'ContentSelector',
            label: 'Content selector',
            name: 'contentSelector',
            occurrences: {
              maximum: 0,
              minimum: 0,
            },
          },
        ],
        label: 'Option 2',
        name: 'option_2',
      },
      {
        elements: [
          {
            label: 'Single-selection OptionSet',
            name: 'radioOptionSet',
          },
          {
            label: 'Option 3',
            name: 'option_3',
          },
        ],
        items: [
          {
            formItemType: 'Input',
            inputType: 'TextArea',
            label: 'Text Area',
            name: 'textarea',
            occurrences: {
              maximum: 1,
              minimum: 0,
            },
          },
          {
            formItemType: 'Input',
            inputType: 'Long',
            label: 'Long',
            name: 'long',
            occurrences: {
              maximum: 1,
              minimum: 0,
            },
          },
        ],
        label: 'Option 3',
        name: 'option_3',
      },
      {
        formItemType: 'Input',
        inputType: 'TextArea',
        label: 'Text Area',
        name: 'textarea',
        occurrences: {
          maximum: 1,
          minimum: 0,
        },
        elements: [
          {
            label: 'Single-selection OptionSet',
            name: 'radioOptionSet',
          },
          {
            label: 'Option 3',
            name: 'option_3',
          },
          {
            label: 'Text Area',
            name: 'textarea',
          },
        ],
      },
    ];

    expect(received).toEqual(expected);
  });
});

describe('getDataPathsToEditableItems', () => {
  it('includes an editable input with no stored value at an index-less path', () => {
    const schema: Schema = {
      form: [
        {
          formItemType: 'Input',
          name: 'description',
          label: 'Description',
          occurrences: { maximum: 1, minimum: 0 },
          inputType: 'TextLine',
        },
        {
          formItemType: 'Input',
          name: 'baseUrl',
          label: 'Base URL',
          occurrences: { maximum: 1, minimum: 0 },
          inputType: 'TextLine',
        },
      ],
      name: 'Test',
    };

    const data: ContentData = {
      contentId: '1',
      contentPath: '/x',
      fields: [{ name: 'description', type: 'String', values: [{ v: 'hello' }] }],
      topic: 'topic',
    };

    const received = getDataPathsToEditableItems(getFormItemsWithPaths(schema.form), data).map(
      pathToString,
    );

    expect(received).toContain('/description');
    expect(received).toContain('/baseUrl');
  });

  it('does not include inputs inside an uninstantiated set', () => {
    const schema: Schema = {
      form: [
        {
          formItemType: 'ItemSet',
          name: 'mySet',
          label: 'My Set',
          occurrences: { maximum: 5, minimum: 0 },
          items: [
            {
              formItemType: 'Input',
              name: 'inner',
              label: 'Inner',
              occurrences: { maximum: 1, minimum: 0 },
              inputType: 'TextLine',
            },
          ],
        },
      ],
      name: 'Test',
    };

    const data: ContentData = { contentId: '1', contentPath: '/x', fields: [], topic: 'topic' };

    const received = getDataPathsToEditableItems(getFormItemsWithPaths(schema.form), data).map(
      pathToString,
    );

    expect(received).not.toContain('/mySet/inner');
  });

  it('includes an empty input inside an instantiated set', () => {
    const schema: Schema = {
      form: [
        {
          formItemType: 'ItemSet',
          name: 'mySet',
          label: 'My Set',
          occurrences: { maximum: 5, minimum: 0 },
          items: [
            {
              formItemType: 'Input',
              name: 'inner',
              label: 'Inner',
              occurrences: { maximum: 1, minimum: 0 },
              inputType: 'TextLine',
            },
          ],
        },
      ],
      name: 'Test',
    };

    const data: ContentData = {
      contentId: '1',
      contentPath: '/x',
      fields: [{ name: 'mySet', type: 'PropertySet', values: [{ set: [] }] }],
      topic: 'topic',
    };

    const received = getDataPathsToEditableItems(getFormItemsWithPaths(schema.form), data).map(
      pathToString,
    );

    expect(received).toContain('/mySet/inner');
  });

  it('emits a per-occurrence leaf path when one occurrence of a repeated set is empty', () => {
    const schema: Schema = {
      form: [
        {
          formItemType: 'ItemSet',
          name: 'mySet',
          label: 'My Set',
          occurrences: { maximum: 5, minimum: 0 },
          items: [
            {
              formItemType: 'Input',
              name: 'inner',
              label: 'Inner',
              occurrences: { maximum: 1, minimum: 0 },
              inputType: 'TextLine',
            },
          ],
        },
      ],
      name: 'Test',
    };

    const data: ContentData = {
      contentId: '1',
      contentPath: '/x',
      fields: [
        {
          name: 'mySet',
          type: 'PropertySet',
          values: [
            { set: [{ name: 'inner', type: 'String', values: [{ v: 'filled' }] }] },
            { set: [] },
          ],
        },
      ],
      topic: 'topic',
    };

    const received = getDataPathsToEditableItems(getFormItemsWithPaths(schema.form), data).map(
      pathToString,
    );

    expect(received).toContain('/mySet/inner');
    expect(received).toContain('/mySet[1]/inner');
  });
});

function getRootInputsSchema(): Schema {
  return {
    form: [
      {
        formItemType: 'Input',
        name: 'myHtmlArea',
        label: 'HtmlArea',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        inputType: 'HtmlArea',
      },
      {
        formItemType: 'Input',
        name: 'myImageSelector',

        label: 'Image selector (tree-structured)',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        inputType: 'ImageSelector',
      },
      {
        formItemType: 'Input',
        name: 'myLong',

        label: 'Long',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },

        inputType: 'Long',
      },
      {
        formItemType: 'Input',
        name: 'myRelationship',

        label: 'Content selector (flat)',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },

        inputType: 'ContentSelector',
      },
      {
        formItemType: 'Input',
        name: 'myTextArea',
        label: 'TextArea',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        inputType: 'TextArea',
      },
      {
        formItemType: 'Input',
        name: 'myTextLine',
        label: 'TextLine',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        inputType: 'TextLine',
      },
    ],
    name: 'All the Input Types',
  };
}

function getFieldSetSchema(): Schema {
  return {
    form: [
      {
        formItemType: 'Layout',
        name: 'fieldSet10',
        items: [
          {
            formItemType: 'Input',
            name: 'myTextAreas',
            label: 'TextAreas',
            occurrences: {
              maximum: 5,
              minimum: 0,
            },
            inputType: 'TextArea',
          },
        ],
        label: 'FieldSet',
      },
    ],
    name: 'All the Input Types',
  };
}

function getFormOptionSetSchema(): Schema {
  return {
    form: [
      {
        formItemType: 'OptionSet',
        selection: { minimum: 0, maximum: 1 },
        name: 'checkOptionSet',
        options: [
          {
            name: 'option_1',
            label: 'Option 1',
            items: [],
          },
          {
            name: 'option_2',
            label: 'Option 2',
            items: [
              {
                formItemType: 'Input',
                name: 'contentSelector',
                label: 'Content selector',
                occurrences: {
                  maximum: 0,
                  minimum: 0,
                },
                inputType: 'ContentSelector',
              },
            ],
          },
          {
            name: 'option_3',
            label: 'Option 3',
            items: [
              {
                formItemType: 'Input',
                name: 'textarea',
                label: 'Text Area',
                occurrences: {
                  maximum: 1,
                  minimum: 0,
                },
                inputType: 'TextArea',
              },
              {
                formItemType: 'Input',
                name: 'long',
                label: 'Long',
                occurrences: {
                  maximum: 1,
                  minimum: 0,
                },
                inputType: 'Long',
              },
            ],
          },
        ],
        label: 'Multi-selection OptionSet',

        occurrences: {
          maximum: 1,
          minimum: 1,
        },
      },
    ],
    name: 'All the Input Types',
  };
}

function getFullSchema(): Schema {
  return {
    form: [
      {
        formItemType: 'Input',
        name: 'contentTypeFilter',
        label: 'Content Type Filter',
        occurrences: {
          maximum: 1,
          minimum: 0,
        },
        inputType: 'ContentTypeFilter',
      },
      {
        formItemType: 'Input',
        name: 'contentTypeFilter2',
        label: 'Content Type Filter 2',
        occurrences: {
          maximum: 3,
          minimum: 0,
        },
        inputType: 'ContentTypeFilter',
      },
      {
        formItemType: 'Input',
        name: 'myCheckbox',
        label: 'Checkbox',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        inputType: 'Checkbox',
      },
      {
        formItemType: 'Input',
        name: 'myComboBox',
        label: 'ComboBox',
        occurrences: {
          maximum: 2,
          minimum: 0,
        },
        inputType: 'ComboBox',
      },
      {
        formItemType: 'Input',
        name: 'myDate',
        label: 'Date',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        inputType: 'Date',
      },
      {
        formItemType: 'Input',
        name: 'myDateTime',
        label: 'DateTime',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        inputType: 'DateTime',
      },
      {
        formItemType: 'Input',
        name: 'myDouble',
        label: 'Double',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        inputType: 'Double',
      },
      {
        formItemType: 'Input',
        name: 'myGeoPoint',
        label: 'GeoPoint',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        inputType: 'GeoPoint',
      },
      {
        formItemType: 'Input',
        name: 'myHtmlArea',
        label: 'HtmlArea',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        inputType: 'HtmlArea',
      },
      {
        formItemType: 'Input',
        name: 'myImageSelector',

        label: 'Image selector (tree-structured)',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        inputType: 'ImageSelector',
      },
      {
        formItemType: 'Input',
        name: 'myImageSelector2',

        label: 'Image selector (flat - by default)',
        occurrences: {
          maximum: 1,
          minimum: 1,
        },

        inputType: 'ImageSelector',
      },
      {
        formItemType: 'Input',
        name: 'myMediaSelector',
        label: 'Media selector',
        occurrences: {
          maximum: 1,
          minimum: 1,
        },

        inputType: 'MediaSelector',
      },
      {
        formItemType: 'Input',
        name: 'myMediaSelector2',

        label: 'Media selector',
        occurrences: {
          maximum: 0,
          minimum: 1,
        },

        inputType: 'MediaSelector',
      },
      {
        formItemType: 'Input',
        name: 'myLong',

        label: 'Long',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },

        inputType: 'Long',
      },
      {
        formItemType: 'Input',
        name: 'myRelationship',

        label: 'Content selector (flat)',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },

        inputType: 'ContentSelector',
      },
      {
        formItemType: 'Input',
        name: 'myRelationship2',

        label: 'Content selector (tree-structured)',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },

        inputType: 'ContentSelector',
      },
      {
        formItemType: 'Input',
        name: 'myRelationship3',

        label: 'Content selector (flat, filtered)',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },

        inputType: 'ContentSelector',
      },
      {
        formItemType: 'Input',
        name: 'myRelationship4',

        label: 'Content selector (tree-structured, filtered, 2 max)',
        occurrences: {
          maximum: 2,
          minimum: 0,
        },

        inputType: 'ContentSelector',
      },
      {
        formItemType: 'Input',
        name: 'myRelationship5',

        label: 'Content selector (tree-structured, with status)',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },

        inputType: 'ContentSelector',
      },
      {
        formItemType: 'Input',
        name: 'myRadioButtons',

        label: 'Radio Buttons',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },

        inputType: 'RadioButton',
      },
      {
        formItemType: 'Input',
        name: 'myTag',
        label: 'Tag',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        inputType: 'Tag',
      },
      {
        formItemType: 'Input',
        name: 'myTextArea',
        label: 'TextArea',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        inputType: 'TextArea',
      },
      {
        formItemType: 'Input',
        name: 'myTextLine',
        label: 'TextLine',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        inputType: 'TextLine',
      },
      {
        formItemType: 'Input',
        name: 'myTime',
        label: 'Time',
        occurrences: {
          maximum: 0,
          minimum: 0,
        },
        inputType: 'Time',
      },
      {
        formItemType: 'Layout',
        name: 'fieldSet10',
        items: [
          {
            formItemType: 'Input',
            name: 'myTextAreas',
            label: 'TextAreas',
            occurrences: {
              maximum: 5,
              minimum: 0,
            },
            inputType: 'TextArea',
          },
        ],
        label: 'FieldSet',
      },
      {
        formItemType: 'ItemSet',
        name: 'myItemSet',
        items: [
          {
            formItemType: 'Input',
            name: 'textLine',
            label: 'TextLine',
            occurrences: {
              maximum: 1,
              minimum: 0,
            },
            inputType: 'TextLine',
          },
          {
            formItemType: 'Input',
            name: 'long',
            label: 'Long',
            occurrences: {
              maximum: 1,
              minimum: 0,
            },
            inputType: 'Long',
          },
        ],
        label: 'ItemSet',
        occurrences: {
          maximum: 5,
          minimum: 0,
        },
      },
      {
        formItemType: 'OptionSet',
        selection: { minimum: 0, maximum: 1 },
        name: 'checkOptionSet',
        options: [
          {
            name: 'option_1',
            label: 'Option 1',
            items: [],
          },
          {
            name: 'option_2',
            label: 'Option 2',
            items: [
              {
                formItemType: 'Input',
                name: 'contentSelector',
                label: 'Content selector',
                occurrences: {
                  maximum: 0,
                  minimum: 0,
                },
                inputType: 'ContentSelector',
              },
            ],
          },
          {
            name: 'option_3',
            label: 'Option 3',
            items: [
              {
                formItemType: 'Input',
                name: 'textarea',
                label: 'Text Area',
                occurrences: {
                  maximum: 1,
                  minimum: 0,
                },
                inputType: 'TextArea',
              },
              {
                formItemType: 'Input',
                name: 'long',
                label: 'Long',
                occurrences: {
                  maximum: 1,
                  minimum: 0,
                },
                inputType: 'Long',
              },
            ],
          },
        ],
        label: 'Multi-selection OptionSet',

        occurrences: {
          maximum: 1,
          minimum: 1,
        },
      },
      {
        formItemType: 'OptionSet',
        selection: { minimum: 0, maximum: 1 },
        name: 'radioOptionSet',
        options: [
          {
            name: 'option_1',
            label: 'Option 1',
            items: [],
          },
          {
            name: 'option_2',
            label: 'Option 2',
            items: [
              {
                formItemType: 'Input',
                name: 'contentSelector',
                label: 'Content selector',
                occurrences: {
                  maximum: 0,
                  minimum: 0,
                },
                inputType: 'ContentSelector',
              },
            ],
          },
          {
            name: 'option_3',
            label: 'Option 3',
            items: [
              {
                formItemType: 'Input',
                name: 'textarea',
                label: 'Text Area',
                occurrences: {
                  maximum: 1,
                  minimum: 0,
                },

                inputType: 'TextArea',
              },
              {
                formItemType: 'Input',
                name: 'long',
                label: 'Long',
                occurrences: {
                  maximum: 1,
                  minimum: 0,
                },
                inputType: 'Long',
              },
            ],
          },
        ],
        label: 'Single-selection OptionSet',
        occurrences: {
          maximum: 1,
          minimum: 1,
        },
      },
    ],
    name: 'All the Input Types',
  };
}
