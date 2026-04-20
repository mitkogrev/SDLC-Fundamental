package com.taskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.dto.TaskRequest;
import com.taskmanager.exception.TaskNotFoundException;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Arrays;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TaskController.class)
@DisplayName("TaskController Integration Tests")
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    @Autowired
    private ObjectMapper objectMapper;

    private Task task;
    private TaskRequest taskRequest;

    @BeforeEach
    void setUp() {
        task = new Task();
        task.setId(1L);
        task.setTitle("Test Task");
        task.setDescription("Test Description");
        task.setStatus(TaskStatus.TODO);
        task.setDueDate(LocalDate.of(2025, 12, 31));

        taskRequest = new TaskRequest();
        taskRequest.setTitle("Test Task");
        taskRequest.setDescription("Test Description");
        taskRequest.setStatus(TaskStatus.TODO);
        taskRequest.setDueDate(LocalDate.of(2025, 12, 31));
    }

    @Test
    @DisplayName("GET /api/tasks should return 200 with task list")
    void getAllTasks_ShouldReturn200() throws Exception {
        when(taskService.getAllTasks()).thenReturn(Arrays.asList(task));

        mockMvc.perform(get("/api/tasks"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].title").value("Test Task"))
                .andExpect(jsonPath("$[0].status").value("TODO"));
    }

    @Test
    @DisplayName("GET /api/tasks/{id} should return 200 when task exists")
    void getTaskById_WhenExists_ShouldReturn200() throws Exception {
        when(taskService.getTaskById(1L)).thenReturn(task);

        mockMvc.perform(get("/api/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Task"));
    }

    @Test
    @DisplayName("GET /api/tasks/{id} should return 404 when task not found")
    void getTaskById_WhenNotFound_ShouldReturn404() throws Exception {
        when(taskService.getTaskById(99L))
                .thenThrow(new TaskNotFoundException("Task not found with id: 99"));

        mockMvc.perform(get("/api/tasks/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Task Not Found"));
    }

    @Test
    @DisplayName("POST /api/tasks should return 201 with created task")
    void createTask_ShouldReturn201() throws Exception {
        when(taskService.createTask(any(TaskRequest.class))).thenReturn(task);

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Task"));
    }

    @Test
    @DisplayName("GET /api/tasks/{id} should return all task fields including description and dueDate")
    void getTaskById_ShouldReturnAllFields() throws Exception {
        when(taskService.getTaskById(1L)).thenReturn(task);

        mockMvc.perform(get("/api/tasks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Test Task"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.status").value("TODO"))
                .andExpect(jsonPath("$.dueDate").value("2025-12-31"));
    }

    @Test
    @DisplayName("POST /api/tasks with blank title should return 400 with fieldErrors.title")
    void createTask_WithBlankTitle_ShouldReturn400() throws Exception {
        taskRequest.setTitle("");

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.fieldErrors.title").exists());
    }

    @Test
    @DisplayName("POST /api/tasks with title exceeding 100 chars should return 400 with fieldErrors.title")
    void createTask_WithTitleTooLong_ShouldReturn400WithFieldError() throws Exception {
        taskRequest.setTitle("a".repeat(101));

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.fieldErrors.title").value("Title must not exceed 100 characters"));
    }

    @Test
    @DisplayName("POST /api/tasks with description exceeding 500 chars should return 400 with fieldErrors.description")
    void createTask_WithDescriptionTooLong_ShouldReturn400WithFieldError() throws Exception {
        taskRequest.setDescription("a".repeat(501));

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.fieldErrors.description").value("Description must not exceed 500 characters"));
    }

    @Test
    @DisplayName("PUT /api/tasks/{id} should return 200 with updated task")
    void updateTask_ShouldReturn200() throws Exception {
        when(taskService.updateTask(eq(1L), any(TaskRequest.class))).thenReturn(task);

        mockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(taskRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Task"));
    }

    @Test
    @DisplayName("DELETE /api/tasks/{id} should return 204")
    void deleteTask_ShouldReturn204() throws Exception {
        doNothing().when(taskService).deleteTask(1L);

        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/tasks/{id} should return 404 when task not found")
    void deleteTask_WhenNotFound_ShouldReturn404() throws Exception {
        doThrow(new TaskNotFoundException("Task not found with id: 99"))
                .when(taskService).deleteTask(99L);

        mockMvc.perform(delete("/api/tasks/99"))
                .andExpect(status().isNotFound());
    }
}
