"use client";

import { PasswordInput } from "@/components/password-input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import supabase from "@/lib/supabase-client";
import { compareSync, genSaltSync, hashSync } from "bcryptjs";
import { Trash2Icon } from "lucide-react";
import { KeyboardEvent, useEffect, useState } from "react";

type Roommate = {
  id: number;
  name: string;
};

export default function Home() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [passwordConfirmed, setPasswordConfirmed] = useState<boolean>(false);
  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [turnIndex, setTurnIndex] = useState<number>(0);

  useEffect(() => {
    const storedPassword = localStorage.getItem("storedPassword");
    if (
      storedPassword &&
      compareSync(storedPassword, process.env.NEXT_PUBLIC_PASSWORD_HASH!)
    ) {
      setPasswordConfirmed(true);
    }
    fetchRoommates();
    fetchTurnIndex();
  }, []);

  const fetchRoommates = async () => {
    const { data, error } = await supabase
      .from("roommates")
      .select("*")
      .order("id");

    if (error) console.error("Error fetching roommates:", error);
    else setRoommates(data || []);
  };

  const fetchTurnIndex = async () => {
    const { data, error } = await supabase
      .from("rotation_state")
      .select("turn_index")
      .single();

    if (error) console.error("Error fetching turn index:", error);
    else if (data) setTurnIndex(data.turn_index);
  };

  const updateTurnIndex = async (index: number) => {
    const { data, error } = await supabase
      .from("rotation_state")
      .update({ turn_index: index })
      .match({ id: 1 }); // Assuming only one row with id=1

    if (error) console.error("Error updating turn index:", error);
  };

  const addRoommate = async (name: string) => {
    const { error } = await supabase
      .from("roommates")
      .insert([{ name }])
      .single();

    if (error) console.error("Error adding roommate:", error);
    else fetchRoommates();
  };

  const removeRoommate = async (id: number) => {
    const { error } = await supabase.from("roommates").delete().eq("id", id);

    if (error) console.error("Error removing roommate:", error);
    else {
      const updatedRoommates = roommates.filter(
        (roommate) => roommate.id !== id,
      );
      setRoommates(updatedRoommates);
      if (turnIndex >= updatedRoommates.length) {
        setTurnIndex(0);
        updateTurnIndex(0);
      }
    }
  };

  const nextTurn = () => {
    setTurnIndex((prevTurnIndex) => {
      const newIndex = (prevTurnIndex + 1) % roommates.length;
      updateTurnIndex(newIndex);
      return newIndex;
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && event.currentTarget.value) {
      addRoommate(event.currentTarget.value);
      event.currentTarget.value = "";
    }
  };

  const onSubmit = () => {
    if (compareSync(currentPassword, process.env.NEXT_PUBLIC_PASSWORD_HASH!)) {
      localStorage.setItem("storedPassword", currentPassword);
      toast({
        title: "Ayo",
        description: "Welcome",
      });
      setPasswordConfirmed(true);
    } else {
      toast({
        title: "Password Incorrect",
        description: "Feel free to try again :)",
      });
    }
  };

  if (passwordConfirmed) {
    return (
      <div className="max-w-md p-4 w-full">
        <h1 className="text-2xl font-bold mb-4">Garbage Duty Roster</h1>
        <ul className="space-y-2">
          {roommates.map((roommate, index) => (
            <li
              key={index}
              className={`flex items-center justify-between p-4 rounded-lg shadow-md ${
                index === turnIndex
                  ? "bg-secondary-foreground text-secondary"
                  : "bg-background"
              }`}
            >
              <div className="flex items-center gap-4">
                <Avatar className="w-10 h-10 rounded-full text-primary">
                  <AvatarFallback>
                    {roommate.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{roommate.name}</span>
                {index === turnIndex && (
                  <Badge className="bg-green-600">On duty</Badge>
                )}
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
          <Button className="w-full" onClick={nextTurn}>
            Rotate
          </Button>
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
  } else {
    return (
      <Card className="max-w-md p-4">
        <CardHeader>
          <CardTitle>Password Required</CardTitle>
          <CardDescription>
            Password required to access the website due to some certain people
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter Password..."
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={onSubmit}>
            Enter
          </Button>
        </CardFooter>
      </Card>
    );
  }
}
