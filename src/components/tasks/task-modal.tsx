"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format, parseISO, parse } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Task } from "./task";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface TaskModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onSaveAction: (task: Partial<Task>) => void;
  task: Task | null;
}

const getTodayDateString = () => {
  return format(new Date(), 'yyyy-MM-dd');
}

export default function TaskModal({ isOpen, onCloseAction: onClose, onSaveAction: onSave, task }: TaskModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>({
    title: "",
    description: "",
    dueDate: getTodayDateString(),
    category: "General",
    isCompleted: false,
  });
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        id: task.id,
        title: task.title,
        description: task.description || "",
        dueDate: task.dueDate ? format(parseISO(task.dueDate), 'yyyy-MM-dd') : getTodayDateString(),
        category: task.category || "General",
        isCompleted: task.isCompleted,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        dueDate: getTodayDateString(),
        category: "General",
        isCompleted: false,
      });
    }
    setCalendarOpen(false);
  }, [task, isOpen]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        // Format the selected date using its local parts
        dueDate: format(date, 'yyyy-MM-dd'),
      }));
      setCalendarOpen(false); // Close popover after selecting date
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      toast({ title: "Validation Error", description: "Title is required.", variant: "destructive" });
      return;
    }
    if (!formData.dueDate) {
      toast({ title: "Validation Error", description: "Due date is required.", variant: "destructive" });
      return;
    }
    onSave(formData);
  };

  const selectedDate = formData.dueDate ? parse(formData.dueDate, 'yyyy-MM-dd', new Date()) : undefined;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose();
        setCalendarOpen(false);
      }
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{task ? "Edit Task" : "Create New Task"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title || ""}
                onChange={handleChange}
                placeholder="E.g., Buy groceries"
                required
              />
            </div>
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description <span className="text-muted-foreground">(Optional)</span></Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Add more details..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.dueDate && "text-muted-foreground" // Style placeholder state
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      onSelect={handleDateChange}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category || "General"}
                  onValueChange={(value) => handleSelectChange("category", value)}
                  name="category"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Work">Work</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Shopping">Shopping</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
