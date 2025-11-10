import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { CheckSquare, Plus, Trash2, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const { toast } = useToast();

  const addTask = () => {
    if (!newTask.trim()) {
      toast({
        title: "Error",
        description: "Please enter a task",
        variant: "destructive",
      });
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      completed: false,
      createdAt: new Date(),
    };

    setTasks([...tasks, task]);
    setNewTask("");
    
    toast({
      title: "Task Added",
      description: "Your task has been added successfully",
    });
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    toast({
      title: "Task Deleted",
      description: "Task removed successfully",
    });
  };

  return (
    <Card className="p-6 jarvis-border bg-card/50 backdrop-blur-xl">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold jarvis-text-glow">Task Automation</h2>
        </div>

        <div className="flex gap-2">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addTask()}
            placeholder="Enter a new task..."
            className="jarvis-border bg-background/50"
          />
          <Button onClick={addTask} className="jarvis-glow">
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <AnimatePresence>
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-3 rounded-lg jarvis-border bg-secondary/20"
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                />
                <div className="flex-1">
                  <p
                    className={`${
                      task.completed
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    {task.createdAt.toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTask(task.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {tasks.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <CheckSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No tasks yet. Add one to get started!</p>
          </div>
        )}

        {tasks.length > 0 && (
          <div className="flex justify-between text-sm text-muted-foreground pt-4 border-t jarvis-border">
            <span>Total: {tasks.length}</span>
            <span>Completed: {tasks.filter((t) => t.completed).length}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TaskManager;