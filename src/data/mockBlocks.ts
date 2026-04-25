import type { Block } from "@/blocks";

export const mockBlocks: Block[] = [
  {
    id: "1",
    type: "rapid-log",
    entries: [
      { id: "e1", bullet: "task",     status: "complete", text: "Morning pages" },
      { id: "e2", bullet: "task",     status: "pending",  text: "Review monthly goals" },
      { id: "e3", bullet: "event",    status: "pending",  text: "Team standup 10am" },
      { id: "e4", bullet: "task",     status: "pending",  text: "Work on project proposal" },
      { id: "e5", bullet: "note",     status: "pending",  text: "Good idea: time-block focus work in the morning" },
      { id: "e6", bullet: "task",     status: "migrated", text: "Reply to emails" },
      { id: "e7", bullet: "priority", status: "pending",  text: "Finish reading Deep Work" },
    ],
  },
  {
    id: "2",
    type: "habit-tracker",
    title: "Daily habits",
    habits: [
      { id: "h1", name: "Exercise",  done: true  },
      { id: "h2", name: "Read",      done: false },
      { id: "h3", name: "Meditate",  done: false },
      { id: "h4", name: "No phone before 9am", done: true },
    ],
  },
];
