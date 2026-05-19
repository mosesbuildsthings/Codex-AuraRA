import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Sparkles, Plus, Trash2, ImagePlus, Quote, FileText, Grid3x3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = [
  { value: "adventure", label: "🗺️ Adventure", color: "bg-chart-1/10" },
  { value: "intimacy", label: "💕 Intimacy", color: "bg-destructive/10" },
  { value: "growth", label: "🌱 Growth", color: "bg-chart-2/10" },
  { value: "stability", label: "🏠 Stability", color: "bg-chart-4/10" },
  { value: "communication", label: "💬 Communication", color: "bg-primary/10" },
  { value: "fun", label: "🎉 Fun", color: "bg-chart-3/10" },
  { value: "legacy", label: "👶 Legacy", color: "bg-accent/40" },
  { value: "health", label: "💪 Health", color: "bg-muted" }
];

const COLORS = [
  "bg-primary/10",
  "bg-destructive/10",
  "bg-chart-2/10",
  "bg-chart-4/10",
  "bg-chart-3/10",
  "bg-accent/40",
  "bg-muted"
];

export default function VisionBoard() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: "quote",
    title: "",
    content: "",
    category: "growth"
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [draggingId, setDraggingId] = useState(null);
  const boardRef = useRef(null);

  React.useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["vision-board"],
    queryFn: () => base44.entities.VisionBoardItem.list("-created_date", 100),
    initialData: []
  });

  const filtered = selectedCategory === "all"
    ? items
    : items.filter(item => item.category === selectedCategory);

  const handleAddItem = async () => {
    if (!formData.title || !formData.content) return;

    await base44.entities.VisionBoardItem.create({
      ...formData,
      shared: true,
      position_x: Math.random() * 80,
      position_y: Math.random() * 80
    });

    setFormData({
      type: "quote",
      title: "",
      content: "",
      category: "growth"
    });
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ["vision-board"] });
  };

  const handleDelete = async (id) => {
    await base44.entities.VisionBoardItem.delete(id);
    queryClient.invalidateQueries({ queryKey: ["vision-board"] });
  };

  const handleDragEnd = async (item, e) => {
    if (!boardRef.current) return;

    const rect = boardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    await base44.entities.VisionBoardItem.update(item.id, {
      position_x: Math.max(0, Math.min(100, x)),
      position_y: Math.max(0, Math.min(100, y))
    });

    setDraggingId(null);
    queryClient.invalidateQueries({ queryKey: ["vision-board"] });
  };

  const typeIcons = {
    image: ImagePlus,
    quote: Quote,
    note: FileText
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <span className="font-heading text-xl font-bold">Vision Board</span>
          </div>
        </div>
        <Button
          size="sm"
          className="rounded-full gap-1.5"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus className="w-4 h-4" /> Add Item
        </Button>
      </nav>

      <div className="max-w-6xl mx-auto px-6 pb-20">
        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-6 rounded-2xl bg-card border border-border/60 space-y-4"
            >
              <div>
                <label className="text-sm font-medium mb-2 block">Item Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "image", label: "🖼️ Image" },
                    { value: "quote", label: "💭 Quote" },
                    { value: "note", label: "📝 Note" }
                  ].map(type => (
                    <button
                      key={type.value}
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`p-2 rounded-lg border text-sm font-medium transition-all ${
                        formData.type === type.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted/40 hover:border-primary/40"
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  placeholder="e.g., Paris Honeymoon, Trust..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {formData.type === "image" ? "Image URL" : formData.type === "quote" ? "Quote" : "Note"}
                </label>
                {formData.type === "note" ? (
                  <Textarea
                    placeholder="What does this mean to us?"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="min-h-20"
                  />
                ) : (
                  <Input
                    placeholder={formData.type === "image" ? "https://..." : "Enter quote or inspiration..."}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  />
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setFormData({ ...formData, category: cat.value })}
                      className={`p-2 rounded-lg border text-xs font-medium transition-all ${
                        formData.category === cat.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted/40 hover:border-primary/40"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-full">
                  Cancel
                </Button>
                <Button
                  onClick={handleAddItem}
                  disabled={!formData.title || !formData.content}
                  className="flex-1 rounded-full"
                >
                  <Plus className="w-4 h-4 mr-1.5" /> Add to Board
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category filter */}
        {items.length > 0 && (
          <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All ({items.length})
            </button>
            {CATEGORIES.map(cat => {
              const count = items.filter(i => i.category === cat.value).length;
              return count > 0 ? (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    selectedCategory === cat.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat.label} ({count})
                </button>
              ) : null;
            })}
          </div>
        )}

        {/* Vision board canvas */}
        {isLoading ? (
          <div className="h-96 rounded-2xl bg-muted animate-pulse" />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-border">
            <Grid3x3 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-heading text-lg font-semibold mb-2">Empty Vision Board</h3>
            <p className="text-sm text-muted-foreground mb-6">Add images, quotes, and notes that represent your shared future.</p>
            <Button variant="outline" className="rounded-full" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1.5" /> Add First Item
            </Button>
          </div>
        ) : (
          <div
            ref={boardRef}
            className="relative h-screen max-h-96 rounded-2xl bg-card border-2 border-border/60 overflow-hidden shadow-inner"
          >
            {/* Grid background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
              style={{
                backgroundImage: "linear-gradient(0deg, #000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                backgroundSize: "40px 40px"
              }}
            />

            {/* Items */}
            <AnimatePresence>
              {filtered.map((item) => {
                const TypeIcon = typeIcons[item.type];
                const categoryInfo = CATEGORIES.find(c => c.value === item.category);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    draggable
                    onDragStart={() => setDraggingId(item.id)}
                    onDragEnd={(e) => handleDragEnd(item, e)}
                    className={`absolute p-4 rounded-lg border border-border/60 cursor-move group hover:shadow-lg transition-all w-48 ${categoryInfo?.color || "bg-muted"}`}
                    style={{
                      left: `${item.position_x}%`,
                      top: `${item.position_y}%`,
                      transform: draggingId === item.id ? "scale(1.05)" : "scale(1)"
                    }}
                  >
                    {/* Item type badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        <TypeIcon className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">{item.type}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 rounded-full p-1 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Item content */}
                    {item.type === "image" ? (
                      <img src={item.content} alt={item.title} className="w-full h-24 object-cover rounded-md mb-2" />
                    ) : null}

                    <p className="font-medium text-sm mb-1">{item.title}</p>

                    {item.type !== "image" && (
                      <p className="text-xs text-muted-foreground line-clamp-3">{item.content}</p>
                    )}

                    {/* Category tag */}
                    <div className="mt-2 pt-2 border-t border-border/40">
                      <span className="text-xs text-muted-foreground">{categoryInfo?.label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Hint */}
            <div className="absolute bottom-3 left-3 right-3 text-xs text-muted-foreground/50 pointer-events-none">
              💡 Drag items to rearrange
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-8 p-4 rounded-xl bg-muted/30 border border-border/40">
          <p className="text-xs text-muted-foreground">
            <strong>Collaborative:</strong> Items you add are visible to your partner. You can both arrange and add to this board together.
          </p>
        </div>
      </div>
    </div>
  );
}