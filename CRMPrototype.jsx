import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ id, client, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card onClick={() => onClick(client)} className="cursor-pointer hover:shadow-md mb-2">
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">{client.name}</span>
            <Badge>{client.status}</Badge>
          </div>
          <p className="text-sm text-gray-500">{client.phone}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CRMPrototype() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [pipeline, setPipeline] = useState([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const storedClients = localStorage.getItem("crm_pipeline");
    if (storedClients) {
      setPipeline(JSON.parse(storedClients));
    } else {
      const defaultClients = [
        { id: 1, name: "Zeta Logistics", status: "Lead", phone: "+7 701 123 4567" },
        { id: 2, name: "CoffeePoint", status: "Client", phone: "+7 702 987 6543" },
      ];
      setPipeline(defaultClients);
      localStorage.setItem("crm_pipeline", JSON.stringify(defaultClients));
    }
  }, []);

  const saveClients = (clients) => {
    localStorage.setItem("crm_pipeline", JSON.stringify(clients));
    setPipeline(clients);
  };

  const handleSelectClient = (client) => {
    setSelectedClient(client);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = pipeline.findIndex((c) => c.id === active.id);
      const newIndex = pipeline.findIndex((c) => c.id === over?.id);
      const newPipeline = arrayMove(pipeline, oldIndex, newIndex);
      saveClients(newPipeline);
    }
  };

  const handleSaveNote = () => {
    if (selectedClient) {
      const updatedClients = pipeline.map((client) =>
        client.id === selectedClient.id ? { ...client, note: notes } : client
      );
      saveClients(updatedClients);
    }
  };

  const mockMessages = [
    { sender: "client", text: "Здравствуйте, мы хотим изменить заказ." },
    { sender: "agent", text: "Принято! Обновлю данные и пришлю вам подтверждение." },
    { sender: "client", text: "Спасибо!" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      <div className="col-span-1 space-y-4">
        <h2 className="text-xl font-semibold">Deal Pipeline</h2>
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pipeline} strategy={verticalListSortingStrategy}>
            {pipeline.map((client) => (
              <SortableItem key={client.id} id={client.id} client={client} onClick={handleSelectClient} />
            ))}
          </SortableContext>
        </DndContext>
        <Button className="w-full">+ Add Client</Button>
      </div>

      <div className="col-span-2">
        {selectedClient ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{selectedClient.name}</h2>
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              </TabsList>

              <TabsContent value="details">
                <div className="space-y-2">
                  <Input defaultValue={selectedClient.name} placeholder="Company name" />
                  <Input defaultValue={selectedClient.phone} placeholder="Phone number" />
                  <Input defaultValue="info@client.kz" placeholder="Email address" />
                </div>
              </TabsContent>

              <TabsContent value="notes">
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add a note..." />
                <Button className="mt-2" onClick={handleSaveNote}>Save Note</Button>
              </TabsContent>

              <TabsContent value="tasks">
                <p>No tasks yet.</p>
                <Button>Add Task</Button>
              </TabsContent>

              <TabsContent value="whatsapp">
                <div className="space-y-2">
                  {mockMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-md max-w-xs text-sm ${
                        msg.sender === "agent"
                          ? "bg-blue-100 text-blue-900 self-end ml-auto"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {msg.text}
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a client to view details
          </div>
        )}
      </div>
    </div>
  );
}
