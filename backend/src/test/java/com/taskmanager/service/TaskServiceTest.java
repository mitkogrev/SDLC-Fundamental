package com.taskmanager.service;

import com.taskmanager.dto.TaskRequest;
import com.taskmanager.exception.TaskNotFoundException;
import com.taskmanager.model.Task;
import com.taskmanager.model.TaskStatus;
import com.taskmanager.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaskService Unit Tests")
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

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
    @DisplayName("getAllTasks should return all tasks from repository")
    void getAllTasks_ShouldReturnAllTasks() {
        when(taskRepository.findAll()).thenReturn(Arrays.asList(task));

        List<Task> result = taskService.getAllTasks();

        assertEquals(1, result.size());
        assertEquals("Test Task", result.get(0).getTitle());
        verify(taskRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("getTaskById should return task when it exists")
    void getTaskById_WhenTaskExists_ShouldReturnTask() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        Task result = taskService.getTaskById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test Task", result.getTitle());
    }

    @Test
    @DisplayName("getTaskById should throw TaskNotFoundException when task does not exist")
    void getTaskById_WhenTaskNotFound_ShouldThrowException() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(TaskNotFoundException.class, () -> taskService.getTaskById(99L));
    }

    @Test
    @DisplayName("createTask should persist and return the new task")
    void createTask_ShouldReturnCreatedTask() {
        when(taskRepository.save(any(Task.class))).thenReturn(task);

        Task result = taskService.createTask(taskRequest);

        assertNotNull(result);
        assertEquals("Test Task", result.getTitle());
        assertEquals(TaskStatus.TODO, result.getStatus());
        verify(taskRepository, times(1)).save(any(Task.class));
    }

    @Test
    @DisplayName("createTask should default status to TODO when none is provided")
    void createTask_WithNullStatus_ShouldDefaultToTodo() {
        taskRequest.setStatus(null);
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task saved = invocation.getArgument(0);
            assertEquals(TaskStatus.TODO, saved.getStatus());
            return saved;
        });

        taskService.createTask(taskRequest);

        verify(taskRepository).save(any(Task.class));
    }

    @Test
    @DisplayName("updateTask should update and return the modified task")
    void updateTask_WhenTaskExists_ShouldReturnUpdatedTask() {
        taskRequest.setTitle("Updated Task");
        taskRequest.setStatus(TaskStatus.IN_PROGRESS);

        Task updatedTask = new Task();
        updatedTask.setId(1L);
        updatedTask.setTitle("Updated Task");
        updatedTask.setStatus(TaskStatus.IN_PROGRESS);

        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenReturn(updatedTask);

        Task result = taskService.updateTask(1L, taskRequest);

        assertEquals("Updated Task", result.getTitle());
        assertEquals(TaskStatus.IN_PROGRESS, result.getStatus());
    }

    @Test
    @DisplayName("deleteTask should call repository delete when task exists")
    void deleteTask_WhenTaskExists_ShouldDelete() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        doNothing().when(taskRepository).delete(task);

        assertDoesNotThrow(() -> taskService.deleteTask(1L));

        verify(taskRepository, times(1)).delete(task);
    }

    @Test
    @DisplayName("deleteTask should throw exception when task does not exist")
    void deleteTask_WhenTaskNotFound_ShouldThrowException() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(TaskNotFoundException.class, () -> taskService.deleteTask(99L));
        verify(taskRepository, never()).delete(any(Task.class));
    }
}
