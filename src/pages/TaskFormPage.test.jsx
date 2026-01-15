import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import TaskFormPage from './TaskFormPage';
import * as tasksApi from '../api/tasks.api';

// Mock de las funciones API
vi.mock('../api/tasks.api');

// Mock de react-router-dom
const mockNavigate = vi.fn();
const mockParams = {};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

describe('TaskFormPage - Pruebas Unitarias', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // PRUEBA 1: Renderizado del formulario
  test('debe renderizar el formulario de crear tarea correctamente', () => {
    render(
      <BrowserRouter>
        <TaskFormPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Crear tarea')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Título')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Descripción')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Prioridad')).toBeInTheDocument();
    expect(screen.getByText('Fecha límite')).toBeInTheDocument();
    expect(screen.getByText('Guardar')).toBeInTheDocument();
  });

  // PRUEBA 2: Validación de campos requeridos
  test('debe mostrar errores cuando los campos requeridos están vacíos', async () => {
    render(
      <BrowserRouter>
        <TaskFormPage />
      </BrowserRouter>
    );

    const submitButton = screen.getByText('Guardar');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessages = screen.getAllByText('Este campo es requerido');
      expect(errorMessages).toHaveLength(2);
    });
  });

  // PRUEBA 3: Crear tarea exitosamente
  test('debe crear una tarea cuando el formulario es válido', async () => {
    tasksApi.createTask.mockResolvedValue({ data: {} });

    render(
      <BrowserRouter>
        <TaskFormPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('Título'), {
      target: { value: 'Nueva tarea de prueba' }
    });
    fireEvent.change(screen.getByPlaceholderText('Descripción'), {
      target: { value: 'Descripción de la tarea' }
    });

    fireEvent.click(screen.getByText('Guardar'));

    await waitFor(() => {
      expect(tasksApi.createTask).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/tasks');
    });
  });

  // PRUEBA 4: Opciones de selectores
  test('debe tener todas las opciones de estado y prioridad', () => {
    render(
      <BrowserRouter>
        <TaskFormPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Pendiente')).toBeInTheDocument();
    expect(screen.getByText('En Progreso')).toBeInTheDocument();
    expect(screen.getByText('Completada')).toBeInTheDocument();
    expect(screen.getByText('Baja')).toBeInTheDocument();
    expect(screen.getByText('Media')).toBeInTheDocument();
    expect(screen.getByText('Alta')).toBeInTheDocument();
  });
});