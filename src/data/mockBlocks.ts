import type { Block } from "@/blocks";

export const mockBlocks: Block[] = [
  {
    id: "1",
    type: "text",
    content: "## March 19, 2025\n\nToday's focus: Build the core foundation for the bullet journal app.",
  },
  {
    id: "2",
    type: "checklist",
    title: "Daily Tasks",
    items: [
      { id: "c1", text: "Review and plan the day", checked: true },
      { id: "c2", text: "Implement draggable blocks", checked: false },
      { id: "c3", text: "Test the page editor", checked: false },
    ],
  },
  {
    id: "3",
    type: "habit-tracker",
    title: "Today",
    habits: [
      { id: "h1", name: "Exercise", done: false },
      { id: "h2", name: "Read", done: false },
      { id: "h3", name: "Meditate", done: false },
      { id: "h4", name: "Journal", done: false },
    ],
  },
  {
    id: "4",
    type: "text",
    content: "Notes: Keep the architecture clean and scalable for future features.",
  },
];
