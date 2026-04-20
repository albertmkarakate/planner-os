import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { 
  Network, 
  Search, 
  Upload, 
  X, 
  Maximize2, 
  Minus, 
  Plus,
  Loader2,
  FileText,
  Link as LinkIcon,
  MousePointer2,
  Settings2,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { synthesizeNeuralGraph } from "../lib/gemini";

interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  summary: string;
  isExisting: boolean;
  val: number;
}

interface Edge extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
  type: string;
}

interface KnowledgeGraphViewProps {
  onOpenNotebook?: (title: string) => void;
}

export default function KnowledgeGraphView({ onOpenNotebook }: KnowledgeGraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [nodes, setNodes] = useState<Node[]>(() => {
    const saved = localStorage.getItem("neural_graph_nodes");
    return saved ? JSON.parse(saved) : [];
  });
  
  const [edges, setEdges] = useState<Edge[]>(() => {
    const saved = localStorage.getItem("neural_graph_edges");
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [ingestInput, setIngestInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [zoomLevel, setZoomLevel] = useState(1);

  // Persistence
  useEffect(() => {
    localStorage.setItem("neural_graph_nodes", JSON.stringify(nodes));
    localStorage.setItem("neural_graph_edges", JSON.stringify(edges));
  }, [nodes, edges]);

  // Simulation Logic
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Zoom setup
    const zoom = d3.zoom<SVGSVGElement, unknown>().on("zoom", (event) => {
      g.attr("transform", event.transform);
      setZoomLevel(event.transform.k);
    });
    svg.call(zoom);

    // Forces
    const simulation = d3.forceSimulation<Node, Edge>(nodes)
      .force("link", d3.forceLink<Node, Edge>(edges).id(d => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    // Links
    const link = g.append("g")
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("stroke-width", 1.5);

    // Nodes
    const node = g.append("g")
      .selectAll<SVGGElement, Node>("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedNode(d);
      })
      .call(d3.drag<any, Node>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended) as any);

    node.append("circle")
      .attr("r", (d: Node) => d.isExisting ? 12 : 8)
      .attr("fill", (d: Node) => d.isExisting ? "var(--color-accent)" : "rgba(255,255,255,0.2)")
      .attr("stroke", "rgba(255,255,255,0.1)")
      .attr("stroke-width", 2)
      .style("filter", (d: Node) => d.isExisting ? `drop-shadow(0 0 8px var(--color-accent))` : "none");

    node.append("text")
      .text((d: Node) => d.label)
      .attr("x", 15)
      .attr("y", 4)
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("fill", "rgba(255,255,255,0.5)");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [nodes, edges]);

  const handleIngest = async () => {
    if (!ingestInput.trim()) return;
    setIsSynthesizing(true);
    
    try {
      const savedNotes = localStorage.getItem("knowledge_notes");
      const notebookTitles = savedNotes ? JSON.parse(savedNotes).map((n: any) => n.title) : [];
      
      const result = await synthesizeNeuralGraph(ingestInput, notebookTitles);
      
      if (result) {
        // Merge nodes
        const newNodes = [...nodes];
        result.nodes.forEach((n: any) => {
          if (!newNodes.find(en => en.id === n.id)) {
            newNodes.push({ ...n, val: 1 });
          }
        });
        
        // Merge edges
        const newEdges = [...edges];
        result.edges.forEach((e: any) => {
          if (!newEdges.find(ee => 
            (typeof ee.source === 'string' ? ee.source === e.source : ee.source.id === e.source) && 
            (typeof ee.target === 'string' ? ee.target === e.target : ee.target.id === e.target)
          )) {
            newEdges.push(e);
          }
        });
        
        setNodes(newNodes);
        setEdges(newEdges);
        setIngestInput("");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const filteredNodes = nodes.filter(n => 
    n.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col gap-6">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-bold text-4xl tracking-tight text-white flex items-center gap-3">
            <Network className="text-[var(--color-accent)] animate-pulse" size={32} />
            Neural Knowledge Graph
          </h2>
          <p className="text-[var(--color-text-secondary)] text-sm font-medium">
            Automated entity synthesis & semantic clustering
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
            <input 
              type="text" 
              placeholder="Query neural nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[var(--color-accent)] transition-all"
            />
          </div>
          <button 
            onClick={handleIngest}
            disabled={isSynthesizing || !ingestInput.trim()}
            className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-xl text-xs font-bold shadow-lg shadow-[var(--color-accent)]/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex items-center gap-2"
          >
            {isSynthesizing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
            Synthesize
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* 2. Graph Visualizer Area */}
        <div className="flex-1 bg-black/20 rounded-3xl border border-white/5 relative overflow-hidden group" ref={containerRef}>
          {nodes.length === 0 && !isSynthesizing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/20 border border-dashed border-white/10">
                <BrainCircuit size={32} />
              </div>
              <div>
                <h3 className="font-bold text-white uppercase tracking-widest text-xs">Awaiting Neural Input</h3>
                <p className="text-[10px] text-white/30 max-w-[200px] leading-relaxed">
                  Import text, links, or documents to begin autonomous knowledge mapping.
                </p>
              </div>
            </div>
          )}
          
          <svg ref={svgRef} className="w-full h-full" />
          
          {/* Zoom & Legend Controls */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-2">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex flex-col gap-2">
              <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"><Plus size={14} /></button>
              <div className="h-px bg-white/10 mx-1" />
              <button className="p-2 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-all"><Minus size={14} /></button>
            </div>
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-xl p-3 flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Existing Note</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/20" />
                <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Inferred Concept</span>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isSynthesizing && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20"
                >
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full border-2 border-[var(--color-accent)]/20 animate-ping absolute inset-0" />
                        <div className="w-20 h-20 rounded-full border-t-2 border-[var(--color-accent)] animate-spin" />
                    </div>
                    <div className="text-center">
                        <h4 className="text-white font-bold uppercase tracking-[0.2em] text-xs">Knowledge Mining</h4>
                        <p className="text-white/40 text-[10px] mt-1 font-mono tracking-tighter">
                            Executing semantic entity extraction pipeline...
                        </p>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. Global Ingestion & Node Detail Tab */}
        <div className="w-80 flex flex-col gap-6">
          {/* Quick Ingest Zone */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
              <Upload size={12} /> Neural Ingestion
            </h3>
            <textarea 
              placeholder="Paste article text, research papers, or transcript snippets..."
              value={ingestInput}
              onChange={(e) => setIngestInput(e.target.value)}
              className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-xs text-white resize-none outline-none focus:border-[var(--color-accent)] transition-all font-mono"
            />
            <div className="flex gap-2">
               <button className="flex-1 p-2 bg-white/5 rounded-lg text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2">
                  <FileText size={10} /> Local PDF
               </button>
               <button className="flex-1 p-2 bg-white/5 rounded-lg text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2">
                  <LinkIcon size={10} /> Web URL
               </button>
            </div>
          </div>

          {/* Detailed Node Inspector / History */}
          <div className="flex-1 glass-card overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30">Node Inspector</h3>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-6">
               <AnimatePresence mode="wait">
                 {selectedNode ? (
                   <motion.div 
                     key={selectedNode.id}
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="space-y-6"
                   >
                     <div className="space-y-2">
                        <div className="flex items-start justify-between">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${selectedNode.isExisting ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/20' : 'bg-white/10 text-white/40 border-white/20'}`}>
                                {selectedNode.isExisting ? 'Cross-Linked Note' : 'Derived Insight'}
                            </span>
                            <button onClick={() => setSelectedNode(null)} className="text-white/20 hover:text-white transition-all"><X size={14} /></button>
                        </div>
                        <h4 className="text-xl font-bold text-white leading-tight">{selectedNode.label}</h4>
                     </div>

                     <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                        <p className="text-[11px] text-white/60 leading-relaxed italic">
                           "{selectedNode.summary}"
                        </p>
                     </div>

                     {/* Relationship Mapping */}
                     <div className="space-y-3">
                        <h5 className="text-[9px] font-black uppercase tracking-widest text-white/20">Synaptic Links</h5>
                        <div className="space-y-2">
                           {edges
                             .filter(e => {
                               const sourceId = typeof e.source === 'string' ? e.source : e.source.id;
                               const targetId = typeof e.target === 'string' ? e.target : e.target.id;
                               return sourceId === selectedNode.id || targetId === selectedNode.id;
                             })
                             .map((e, i) => {
                               const sourceId = typeof e.source === 'string' ? e.source : e.source.id;
                               const otherId = sourceId === selectedNode.id 
                                 ? (typeof e.target === 'string' ? e.target : e.target.id)
                                 : sourceId;
                               const otherNode = nodes.find(n => n.id === otherId);
                               
                               return (
                                 <button 
                                   key={i}
                                   onClick={() => setSelectedNode(otherNode || null)}
                                   className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left group"
                                  >
                                   <div className="flex items-center gap-3">
                                      <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-[var(--color-accent)]" />
                                      <span className="text-[10px] font-bold text-white/40 group-hover:text-white">{otherNode?.label}</span>
                                   </div>
                                   <ArrowUpRight size={10} className="text-white/20 group-hover:text-[var(--color-accent)]" />
                                 </button>
                               );
                             })}
                        </div>
                     </div>

                     {selectedNode.isExisting && (
                       <button 
                         onClick={() => onOpenNotebook?.(selectedNode.label)}
                         className="w-full p-4 bg-[var(--color-accent)] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-[var(--color-accent)]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                         Open Notebook Node <ChevronRight size={14} />
                       </button>
                     )}
                   </motion.div>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                       <MousePointer2 size={24} className="text-white/10" />
                       <p className="text-[10px] text-white/20 font-medium max-w-[150px]">
                          Select a node on the neural graph to view semantic details.
                       </p>
                    </div>
                 )}
               </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Internal Icons for the component
function ArrowUpRight(props: any) {
    return <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>;
}

function BrainCircuit(props: any) {
    return <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.125A3 3 0 1 0 10 18"/><path d="M12 5v4"/><path d="M12 13v4"/><path d="M16 13h4"/><path d="M9 13h4"/><path d="M12 9h4"/><path d="M12 13v-4"/></svg>;
}
