import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './App.css';

function TaskTracker() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    axios.get('https://jsonplaceholder.typicode.com/todos')
     .then(response => {
        setTasks(response.data);
      })
     .catch(error => {
        console.error(error);
      });
  }, []);

  const handleAddTask = (e) => {
    e.preventDefault();
    const newTaskObject = { title: newTask, completed: false };
    axios.post('https://jsonplaceholder.typicode.com/todos', newTaskObject)
     .then(response => {
        setTasks([...tasks, response.data]);
        setNewTask('');
      })
     .catch(error => {
        console.error(error);
      });
  };

  const handleDeleteTask = (taskId) => {
    axios.delete(`https://jsonplaceholder.typicode.com/todos/${taskId}`)
     .then(response => {
        setTasks(tasks.filter(task => task.id!== taskId));
      })
     .catch(error => {
        console.error(error);
      });
  };

  const handleToggleCompleted = (taskId) => {
    const task = tasks.find(task => task.id === taskId);
    task.completed =!task.completed;
    axios.put(`https://jsonplaceholder.typicode.com/todos/${taskId}`, task)
     .then(response => {
        setTasks([...tasks]);
      })
     .catch(error => {
        console.error(error);
      });
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return task.completed === (filter === 'completed');
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const [reorderedTask] = filteredTasks.splice(result.source.index, 1);
    filteredTasks.splice(result.destination.index, 0, reorderedTask);
    setTasks(filteredTasks);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="task-tracker">
        <h1 style={{textAlign: "center", textDecoration: "underline", color: "rgb(114, 110, 110)"}}>Task Tracker</h1>
        <form onSubmit={handleAddTask} className="input-form">
          <input type="text" className='input-task' value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder="Add new task" />
          <button type="submit" className='add-btn'>Add</button>
        </form>
        <div className="filter">
          <label>
            Filter by status:
            <select value={filter} onChange={handleFilterChange}>
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </label>
        </div>
        <Droppable droppableId="task-list">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {filteredTasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`task ${task.completed? 'completed' : ''}`}
                    >
                      <span>{task.title}</span>
                      <button onClick={() => handleToggleCompleted(task.id)}>Completed</button>
                      <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}

export default TaskTracker;