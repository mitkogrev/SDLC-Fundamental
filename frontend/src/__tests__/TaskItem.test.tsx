import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskItem from '../components/TaskItem';
import { Task } from '../types/Task';

const todoTask: Task = {
  id: 1,
  title: 'Test Task',
  description: 'Test description',
  status: 'TODO',
};

const overdueTask: Task = {
  id: 2,
  title: 'Overdue Task',
  status: 'TODO',
  dueDate: '2020-01-01',
};

const doneTask: Task = {
  id: 3,
  title: 'Finished Task',
  status: 'DONE',
  dueDate: '2020-01-01',
};

describe('TaskItem', () => {
  describe('rendering', () => {
    it('displays task title and status badge', () => {
      render(
        <TaskItem task={todoTask} onEdit={vi.fn()} onDelete={vi.fn()} onStatusChange={vi.fn()} />
      );
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      // "To Do" appears in both the badge span and the status dropdown option
      const todoBadge = screen.getAllByText('To Do').find(el => el.tagName === 'SPAN');
      expect(todoBadge).toBeInTheDocument();
    });

    it('displays task description when present', () => {
      render(
        <TaskItem task={todoTask} onEdit={vi.fn()} onDelete={vi.fn()} onStatusChange={vi.fn()} />
      );
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('shows Overdue badge for past-due tasks not yet done', () => {
      render(
        <TaskItem task={overdueTask} onEdit={vi.fn()} onDelete={vi.fn()} onStatusChange={vi.fn()} />
      );
      expect(screen.getByText('Overdue')).toBeInTheDocument();
    });

    it('does not show Overdue badge for completed tasks', () => {
      render(
        <TaskItem task={doneTask} onEdit={vi.fn()} onDelete={vi.fn()} onStatusChange={vi.fn()} />
      );
      expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
    });

    it('does not show Overdue badge for tasks without a due date', () => {
      render(
        <TaskItem task={todoTask} onEdit={vi.fn()} onDelete={vi.fn()} onStatusChange={vi.fn()} />
      );
      expect(screen.queryByText('Overdue')).not.toBeInTheDocument();
    });
  });

  describe('edit action', () => {
    it('calls onEdit with the task when edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(
        <TaskItem task={todoTask} onEdit={onEdit} onDelete={vi.fn()} onStatusChange={vi.fn()} />
      );

      await user.click(screen.getByRole('button', { name: /edit task/i }));

      expect(onEdit).toHaveBeenCalledWith(todoTask);
    });
  });

  describe('delete confirmation (two-click pattern)', () => {
    it('first click on delete shows Confirm? button', async () => {
      const user = userEvent.setup();
      render(
        <TaskItem task={todoTask} onEdit={vi.fn()} onDelete={vi.fn()} onStatusChange={vi.fn()} />
      );

      await user.click(screen.getByRole('button', { name: /delete task/i }));

      expect(screen.getByText('Confirm?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
    });

    it('second click on confirm calls onDelete with task id', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(
        <TaskItem task={todoTask} onEdit={vi.fn()} onDelete={onDelete} onStatusChange={vi.fn()} />
      );

      await user.click(screen.getByRole('button', { name: /delete task/i }));
      await user.click(screen.getByRole('button', { name: /confirm delete/i }));

      expect(onDelete).toHaveBeenCalledWith(todoTask.id);
    });

    it('does not call onDelete on the first click', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();
      render(
        <TaskItem task={todoTask} onEdit={vi.fn()} onDelete={onDelete} onStatusChange={vi.fn()} />
      );

      await user.click(screen.getByRole('button', { name: /delete task/i }));

      expect(onDelete).not.toHaveBeenCalled();
    });
  });

  describe('status change', () => {
    it('calls onStatusChange with id and new status when dropdown changes', async () => {
      const user = userEvent.setup();
      const onStatusChange = vi.fn().mockResolvedValue(undefined);
      render(
        <TaskItem
          task={todoTask}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onStatusChange={onStatusChange}
        />
      );

      await user.selectOptions(screen.getByLabelText(/change status/i), 'IN_PROGRESS');

      expect(onStatusChange).toHaveBeenCalledWith(todoTask.id, 'IN_PROGRESS');
    });

    it('calls onStatusChange with DONE when Done option is selected', async () => {
      const user = userEvent.setup();
      const onStatusChange = vi.fn().mockResolvedValue(undefined);
      render(
        <TaskItem
          task={todoTask}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onStatusChange={onStatusChange}
        />
      );

      await user.selectOptions(screen.getByLabelText(/change status/i), 'DONE');

      expect(onStatusChange).toHaveBeenCalledWith(todoTask.id, 'DONE');
    });
  });
});
