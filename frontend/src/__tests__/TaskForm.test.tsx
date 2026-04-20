import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TaskForm from '../components/TaskForm';
import { Task } from '../types/Task';

const mockTask: Task = {
  id: 1,
  title: 'Existing Task',
  description: 'Existing description',
  status: 'IN_PROGRESS',
  dueDate: '2026-06-01',
};

describe('TaskForm', () => {
  describe('rendering', () => {
    it('shows "New Task" heading when no task is provided', () => {
      render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
      expect(screen.getByText('New Task')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    });

    it('shows "Edit Task" heading when a task is provided', () => {
      render(<TaskForm task={mockTask} onSubmit={vi.fn()} onCancel={vi.fn()} />);
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
    });

    it('populates all fields with existing task values when editing', () => {
      render(<TaskForm task={mockTask} onSubmit={vi.fn()} onCancel={vi.fn()} />);
      expect(screen.getByLabelText(/title/i)).toHaveValue('Existing Task');
      expect(screen.getByLabelText(/description/i)).toHaveValue('Existing description');
      expect(screen.getByLabelText(/status/i)).toHaveValue('IN_PROGRESS');
      expect(screen.getByLabelText(/due date/i)).toHaveValue('2026-06-01');
    });
  });

  describe('submission', () => {
    it('calls onSubmit with form data when title is valid', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />);

      await user.type(screen.getByLabelText(/title/i), 'New Task Title');
      await user.click(screen.getByRole('button', { name: /create task/i }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'New Task Title', status: 'TODO' })
      );
    });

    it('calls onSubmit with trimmed title', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);
      render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />);

      await user.type(screen.getByLabelText(/title/i), '  Padded Title  ');
      await user.click(screen.getByRole('button', { name: /create task/i }));

      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Padded Title' })
      );
    });

    it('does not call onSubmit when validation fails', async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      render(<TaskForm onSubmit={onSubmit} onCancel={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: /create task/i }));

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
    it('shows error when title is blank', async () => {
      const user = userEvent.setup();
      render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: /create task/i }));

      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    it('shows error when title exceeds 100 characters', async () => {
      const user = userEvent.setup();
      render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      const titleInput = screen.getByLabelText(/title/i);
      fireEvent.change(titleInput, { target: { value: 'a'.repeat(101) } });
      await user.click(screen.getByRole('button', { name: /create task/i }));

      expect(screen.getByText('Title must not exceed 100 characters')).toBeInTheDocument();
    });

    it('shows error when description exceeds 500 characters', async () => {
      const user = userEvent.setup();
      render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      const titleInput = screen.getByLabelText(/title/i);
      const descInput = screen.getByLabelText(/description/i);
      await user.type(titleInput, 'Valid Title');
      fireEvent.change(descInput, { target: { value: 'a'.repeat(501) } });
      await user.click(screen.getByRole('button', { name: /create task/i }));

      expect(screen.getByText('Description must not exceed 500 characters')).toBeInTheDocument();
    });

    it('clears field error when user starts typing in that field', async () => {
      const user = userEvent.setup();
      render(<TaskForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

      await user.click(screen.getByRole('button', { name: /create task/i }));
      expect(screen.getByText('Title is required')).toBeInTheDocument();

      await user.type(screen.getByLabelText(/title/i), 'A');
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
  });

  describe('cancellation', () => {
    it('calls onCancel when close button is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);

      await user.click(screen.getByRole('button', { name: /close form/i }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<TaskForm onSubmit={vi.fn()} onCancel={onCancel} />);

      await user.click(screen.getByRole('button', { name: /^cancel$/i }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });
});
