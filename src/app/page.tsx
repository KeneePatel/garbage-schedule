"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2Icon } from "lucide-react";
import { useState, KeyboardEvent } from "react";

type Roommate = {
  id: number;
  name: string;
};

export default function Home() {
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [turnIndex, setTurnIndex] = useState(0);

  const addRoommate = (name: string) => {
    const newRoommate: Roommate = { id: roommates.length, name };
    setRoommates([...roommates, newRoommate]);
  };

  const removeRoommate = (id: number) => {
    const updatedRoommates = roommates.filter((roommate) => roommate.id !== id);
    setRoommates(updatedRoommates);
    if (turnIndex >= updatedRoommates.length) {
      setTurnIndex(0);
    }
  };

  const nextTurn = () => {
    setTurnIndex((turnIndex + 1) % roommates.length);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && event.currentTarget.value) {
      addRoommate(event.currentTarget.value);
      event.currentTarget.value = "";
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Garbage Duty Roster</h1>
      <ul className="space-y-2">
        {roommates.map((roommate) => (
          <li
            key={roommate.id}
            className={`flex items-center justify-between p-4 rounded-lg shadow-md ${
              roommate.id === turnIndex
                ? "bg-secondary-foreground text-secondary"
                : "bg-background"
            }`}
          >
            <div className="flex items-center gap-4">
              <Avatar className="w-10 h-10 rounded-full text-primary">
                <AvatarImage src="/placeholder-user.jpg" alt={roommate.name} />
                <AvatarFallback>
                  {roommate.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{roommate.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => removeRoommate(roommate.id)}
              >
                <Trash2Icon className="w-4 h-4 stroke-black" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-col my-2 gap-2">
        <Button onClick={nextTurn}>Rotate</Button>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Add a new roommate"
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
    </div>
  );
}
