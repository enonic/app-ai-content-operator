package com.enonic.app.ai.contentoperator.ws;

import java.util.concurrent.ConcurrentHashMap;

public class OperationRegistry {

    // ! Static so every script context on the node shares one view of the running operations
    private static final ConcurrentHashMap<String, Boolean> OPERATIONS = new ConcurrentHashMap<>();

    public boolean isActive(String id) {
        return OPERATIONS.containsKey(id);
    }

    public boolean add(String id) {
        return OPERATIONS.putIfAbsent(id, Boolean.TRUE) == null;
    }

    public void remove(String id) {
        OPERATIONS.remove(id);
    }
}
