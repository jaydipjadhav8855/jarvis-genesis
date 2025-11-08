import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    // Load tasks from localStorage
    const saved = localStorage.getItem("jarvis-tasks");
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Save tasks to localStorage
    localStorage.setItem("jarvis-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTask.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
    };

    setTasks([...tasks, task]);
    setNewTask("");
    toast({
      title: "Task Added",
      description: "कार्य जोडले गेले आहे",
    });
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({
      title: "Task Deleted",
      description: "कार्य हटवले गेले आहे",
    });
  };

  return (
    <Card className="p-6 jarvis-border bg-card/50 backdrop-blur-xl space-y-4">
      <h3 className="text-lg font-semibold jarvis-text-glow">Task Manager</h3>

      <div className="flex gap-2">
        <Input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="नवीन कार्य... (New task...)"
          className="jarvis-border bg-background/50"
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
        />
        <Button onClick={addTask} className="jarvis-glow">
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-center gap-2 p-3 rounded-lg jarvis-border bg-background/30 hover:bg-background/50 transition-all ${
                task.completed ? 'opacity-60' : ''
              }`}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className="flex-shrink-0"
              >
                {task.completed ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground" />
                )}
              </button>
              
              <span className={`flex-1 text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {task.text}
              </span>
              
              <Button
                onClick={() => deleteTask(task.id)}
                variant="ghost"
                size="sm"
                className="flex-shrink-0"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {tasks.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">
            No tasks yet. Add one above!
          </p>
        )}
      </div>

      <div className="text-xs text-muted-foreground pt-2 border-t jarvis-border/50">
        Total: {tasks.length} | Completed: {tasks.filter(t => t.completed).length}
      </div>
    </Card>
  );
};

export default TaskManager;
