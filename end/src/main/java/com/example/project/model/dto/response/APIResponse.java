package com.example.project.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class APIResponse<T> {
    private String message;
    private T response;
    private Boolean success;
    private int code;
}