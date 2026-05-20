import React, { useState, useEffect, useRef } from 'react';
import { 
  Network, Sliders, FileDown, Trash2, Link as LinkIcon, 
  Layers, Info, Cable 
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  category?: string;
  quantity: number;
}

interface TopologyPlannerProps {
  items: CartItem[];
}

interface Node {
  id: string;
  label: string;
  type: 'camera' | 'switch' | 'nvr' | 'router' | 'outdoor_station' | 'indoor_screen' | 'accessory';
  x: number;
  y: number;
}

interface Link {
  id: string;
  from: string;
  to: string;
  type: 'RJ45_CAT6' | 'FIBER' | 'COAXIAL' | '2_WIRE';
  label: string;
}

const TopologyPlanner: React.FC<TopologyPlannerProps> = ({ items }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedLink, setSelectedLink] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [cableType, setCableType] = useState<'RJ45_CAT6' | 'FIBER' | 'COAXIAL' | '2_WIRE'>('RJ45_CAT6');
  
  const canvasRef = useRef<SVGSVGElement>(null);
  const draggingNodeRef = useRef<string | null>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!items || items.length === 0) {
      setNodes([]);
      setLinks([]);
      return;
    }

    const generatedNodes: Node[] = [];
    const generatedLinks: Link[] = [];

    // 1. Nœud d'infrastructure central (Passerelle Internet)
    generatedNodes.push({ id: 'router-root', label: 'Routeur Principal / Box', type: 'router', x: 400, y: 50 });

    let switchCount = 0;
    let lastSwitchId = 'router-root';
    let hasSwitchInCart = false;

    // Détection première des Switches/Commutateurs pour l'ossature réseau
    items.forEach((item) => {
      const nameLower = (item.name || '').toLowerCase();
      const catLower = (item.category || '').toLowerCase();

      if (nameLower.includes('switch') || nameLower.includes('commutateur') || catLower.includes('switch')) {
        hasSwitchInCart = true;
        for (let q = 0; q < item.quantity; q++) {
          switchCount++;
          const switchId = `switch-${switchCount}`;
          generatedNodes.push({
            id: switchId,
            label: `${item.name} (#${switchCount})`,
            type: 'switch',
            x: 200 + switchCount * 200,
            y: 160,
          });
          generatedLinks.push({
            id: `link-router-sw-${switchId}`,
            from: 'router-root',
            to: switchId,
            type: 'RJ45_CAT6',
            label: 'Uplink LAN',
          });
          lastSwitchId = switchId;
        }
      }
    });

    // Si aucun switch physique n'est dans le panier, on crée un Switch PoE virtuel d'intégration
    if (!hasSwitchInCart) {
      lastSwitchId = 'switch-infra-virtual';
      generatedNodes.push({ id: 'switch-infra-virtual', label: 'Switch PoE Central', type: 'switch', x: 400, y: 160 });
      generatedLinks.push({ id: 'link-router-virtual-sw', from: 'router-root', to: 'switch-infra-virtual', type: 'RJ45_CAT6', label: 'Uplink' });
    }

    // Compteurs pour la distribution visuelle des périphériques sur la ligne du bas (y: 340)
    let colIndex = 0;

    // 2. Deuxième passe : Analyse et raccordement de TOUT le matériel périphérique
    items.forEach((item) => {
      const nameLower = (item.name || '').toLowerCase();
      const catLower = (item.category || '').toLowerCase();
      
      // On ignore les switches qu'on a déjà traités
      if (nameLower.includes('switch') || nameLower.includes('commutateur') || catLower.includes('switch')) {
        return;
      }

      for (let q = 0; q < item.quantity; q++) {
        colIndex++;
        const uniqueId = `${item.id}-${q}`;
        const currentX = 80 + (colIndex * 140) % 700;
        const currentY = 340 + Math.floor(colIndex / 5) * 80;

        // CATEGORIE A : Enregistreurs (NVR / DVR)
        if (nameLower.includes('nvr') || nameLower.includes('enregistreur') || nameLower.includes('dvr')) {
          generatedNodes.push({
            id: `nvr-${uniqueId}`,
            label: item.name,
            type: 'nvr',
            x: 180,
            y: 160, // Aligné avec le switch
          });
          generatedLinks.push({
            id: `link-nvr-${uniqueId}`,
            from: 'router-root',
            to: `nvr-${uniqueId}`,
            type: 'RJ45_CAT6',
            label: 'Réseau',
          });
          colIndex--; // Ne compte pas pour l'alignement du bas
        }
        
        // CATEGORIE B : Platines de rue (Vidéophonie extérieure)
        else if (nameLower.includes('platine') || nameLower.includes('rue') || nameLower.includes('extérieur') || nameLower.includes('interphone')) {
          generatedNodes.push({
            id: `outdoor-${uniqueId}`,
            label: `${(item.name || 'Platine').split(' ')[0]} (Poste Extérieur)`,
            type: 'outdoor_station',
            x: currentX,
            y: currentY,
          });
          generatedLinks.push({
            id: `link-outdoor-${uniqueId}`,
            from: lastSwitchId,
            to: `outdoor-${uniqueId}`,
            type: 'RJ45_CAT6',
            label: 'PoE (Alim+Data)',
          });
        }

        // CATEGORIE C : Écrans intérieurs / Moniteurs
        else if (nameLower.includes('ecran') || nameLower.includes('écran') || nameLower.includes('moniteur') || nameLower.includes('console')) {
          generatedNodes.push({
            id: `indoor-${uniqueId}`,
            label: `${(item.name || 'Écran').split(' ')[0]} (Moniteur Intérieur)`,
            type: 'indoor_screen',
            x: currentX,
            y: currentY,
          });
          generatedLinks.push({
            id: `link-indoor-${uniqueId}`,
            from: lastSwitchId,
            to: `indoor-${uniqueId}`,
            type: 'RJ45_CAT6',
            label: 'PoE (Intercom)',
          });
        }

        // CATEGORIE D : Caméras de sécurité IP ou analogiques
        else if (nameLower.includes('caméra') || nameLower.includes('camera')) {
          generatedNodes.push({
            id: `cam-${uniqueId}`,
            label: item.name,
            type: 'camera',
            x: currentX,
            y: currentY,
          });
          generatedLinks.push({
            id: `link-cam-${uniqueId}`,
            from: lastSwitchId,
            to: `cam-${uniqueId}`,
            type: 'RJ45_CAT6',
            label: 'Flux Vidéo',
          });
        }

        // CATEGORIE E : SÉCURITÉ UNIVERSELLE (Tout autre article non répertorié : câbles, disques durs, accessoires)
        else {
          generatedNodes.push({
            id: `acc-${uniqueId}`,
            label: item.name,
            type: 'accessory',
            x: currentX,
            y: currentY,
          });
          generatedLinks.push({
            id: `link-acc-${uniqueId}`,
            from: lastSwitchId,
            to: `acc-${uniqueId}`,
            type: 'RJ45_CAT6',
            label: 'Liaison Système',
          });
        }
      }
    });

    setNodes(generatedNodes);
    setLinks(generatedLinks);
  }, [items]);

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setSelectedNode(nodeId);
    setSelectedLink(null);
    draggingNodeRef.current = nodeId;

    const node = nodes.find(n => n.id === nodeId);
    if (node && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      dragOffsetRef.current = {
        x: e.clientX - rect.left - node.x,
        y: e.clientY - rect.top - node.y
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeRef.current || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffsetRef.current.x;
    const y = e.clientY - rect.top - dragOffsetRef.current.y;

    setNodes(prev => prev.map(n => n.id === draggingNodeRef.current ? { ...n, x, y } : n));
  };

  const handleMouseUp = () => {
    draggingNodeRef.current = null;
  };

  const handleNodeClick = (nodeId: string) => {
    if (isConnecting) {
      if (isConnecting !== nodeId) {
        const newLink: Link = {
          id: `link-manual-${Date.now()}`,
          from: isConnecting,
          to: nodeId,
          type: cableType,
          label: cableType === 'RJ45_CAT6' ? 'RJ45 Cat6' : cableType === 'FIBER' ? 'Fibre' : cableType === '2_WIRE' ? 'Bifilaire (2 fils)' : 'Coaxial'
        };
        setLinks(prev => [...prev, newLink]);
      }
      setIsConnecting(null);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedNode && selectedNode !== 'router-root' && selectedNode !== 'switch-infra-virtual') {
      setNodes(prev => prev.filter(n => n.id !== selectedNode));
      setLinks(prev => prev.filter(l => l.from !== selectedNode && l.to !== selectedNode));
      setSelectedNode(null);
    }
    if (selectedLink) {
      setLinks(prev => prev.filter(l => l.id !== selectedLink));
      setSelectedLink(null);
    }
  };

  const getLinkColor = (type: string) => {
    switch (type) {
      case 'FIBER': return '#0ea5e9';
      case 'COAXIAL': return '#f59e0b';
      case '2_WIRE': return '#ec4899';
      default: return '#4f8f73';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden mt-12 print:border-0 print:shadow-none">
      <div className="p-6 bg-gray-50/70 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Network className="text-brand-green-600" /> Schéma Synoptique de Câblage Automatique
          </h3>
          <p className="text-xs font-medium text-gray-400 mt-0.5">Calculé dynamiquement selon la composition technologique de votre panier</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setIsConnecting(selectedNode)}
            disabled={!selectedNode}
            className={`px-4 py-2 text-xs font-bold rounded-xl border flex items-center gap-2 transition-all ${isConnecting ? 'bg-orange-50 text-orange-600 border-orange-200 animate-pulse' : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 disabled:opacity-40'}`}
          >
            <Cable size={14} /> {isConnecting ? 'Sélectionnez la cible...' : 'Relier deux éléments'}
          </button>

          <button 
            onClick={handleDeleteSelected}
            disabled={!selectedNode && !selectedLink}
            className="px-4 py-2 text-xs font-bold bg-white text-red-500 border border-red-100 rounded-xl hover:bg-red-50 transition-all flex items-center gap-2 disabled:opacity-40"
          >
            Trash2 Supprimer
          </button>

          <button 
            onClick={() => window.print()}
            className="px-5 py-2 text-xs font-bold bg-gray-900 text-white rounded-xl hover:bg-black transition-all flex items-center gap-2 shadow-sm"
          >
            <FileDown size={14} /> Télécharger le PDF (.pdf)
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 bg-gray-50/30 relative min-h-[500px]">
          <svg
            ref={canvasRef}
            className="w-full h-[520px] outline-none cursor-crosshair select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <g className="opacity-5 print:hidden">
              <pattern id="grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#4F8F73" strokeWidth="1" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </g>

            {/* LIGNES DE LIAISON */}
            {links.map((link) => {
              const fromNode = nodes.find(n => n.id === link.from);
              const toNode = nodes.find(n => n.id === link.to);
              if (!fromNode || !toNode) return null;
              const isSelected = selectedLink === link.id;

              return (
                <g key={link.id} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelectedLink(link.id); setSelectedNode(null); }}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={isSelected ? '#2563eb' : getLinkColor(link.type)}
                    strokeWidth={isSelected ? 4 : 2.5}
                    strokeDasharray={link.type === 'FIBER' ? '4,4' : '0'}
                  />
                  <rect
                    x={(fromNode.x + toNode.x) / 2 - 40}
                    y={(fromNode.y + toNode.y) / 2 - 8}
                    width="80"
                    height="16"
                    rx="4"
                    fill="#ffffff"
                    stroke={isSelected ? '#2563eb' : '#e2e8f0'}
                    strokeWidth="1"
                  />
                  <text x={(fromNode.x + toNode.x) / 2} y={(fromNode.y + toNode.y) / 2 + 4} textAnchor="middle" className="text-[8px] font-bold fill-gray-500">
                    {link.label}
                  </text>
                </g>
              );
            })}

            {/* BLOCS MATÉRIELS (NŒUDS) */}
            {nodes.map((node) => {
              const isSelected = selectedNode === node.id;
              let bgBox = '#f3f4f6';
              let strokeBox = '#9ca3af';

              if (node.type === 'router') { bgBox = '#fef3c7'; strokeBox = '#d97706'; }
              else if (node.type === 'switch') { bgBox = '#e6f2ec'; strokeBox = '#4f8f73'; }
              else if (node.type === 'nvr') { bgBox = '#dbeafe'; strokeBox = '#2563eb'; }
              else if (node.type === 'outdoor_station') { bgBox = '#ffe4e6'; strokeBox = '#e11d48'; }
              else if (node.type === 'indoor_screen') { bgBox = '#f0fdf4'; strokeBox = '#16a34a'; }
              else if (node.type === 'camera') { bgBox = '#f3f4f6'; strokeBox = '#4b5563'; }

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y})`}
                  onMouseDown={(e) => handleMouseDown(e, node.id)}
                  onClick={(e) => { e.stopPropagation(); handleNodeClick(node.id); }}
                >
                  <rect x="-65" y="-20" width="130" height="40" rx="10" fill={bgBox} stroke={isSelected ? '#2563eb' : strokeBox} strokeWidth={isSelected ? 3 : 1.5} />
                  <text x="0" y="4" textAnchor="middle" className="text-[9px] font-extrabold fill-gray-800">
                    {(node.label || 'Article Inconnu').length > 20 ? (node.label || 'Article Inconnu').slice(0, 18) + '..' : (node.label || 'Article Inconnu')}
                  </text>
                  <rect x="-35" y="-28" width="70" height="10" rx="3" fill={strokeBox} />
                  <text x="0" y="-20" textAnchor="middle" className="text-[7px] font-bold fill-white uppercase tracking-wider">
                    {node.type.replace('_', ' ')}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* PANNEAU LATÉRAL & LÉGENDE */}
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-100 p-6 bg-gray-50/30 space-y-6">
          <div className="print:hidden">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Sliders size={14} /> Type de câble manuel
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'RJ45_CAT6', label: 'Câble Ethernet Cat6', color: '#4f8f73' },
                { id: '2_WIRE', label: 'Technologie 2 Fils', color: '#ec4899' },
                { id: 'FIBER', label: 'Fibre Optique', color: '#0ea5e9' }
              ].map(type => (
                <button
                  key={type.id}
                  onClick={() => setCableType(type.id as any)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center gap-2.5 ${cableType === type.id ? 'bg-white border-gray-900 shadow-sm font-bold' : 'bg-transparent border-gray-100 text-gray-600'}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: type.color }} />
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Layers size={14} /> Légende Technique
            </h4>
            <div className="space-y-2 text-xs font-bold text-gray-700">
              <div className="flex items-center gap-3"><span className="w-5 h-3 bg-[#fef3c7] border border-[#d97706] rounded" /> Internet / Routeur</div>
              <div className="flex items-center gap-3"><span className="w-5 h-3 bg-[#e6f2ec] border border-[#4f8f73] rounded" /> Switch Réseau (PoE)</div>
              <div className="flex items-center gap-3"><span className="w-5 h-3 bg-[#ffe4e6] border border-[#e11d48] rounded" /> Platine Extérieure</div>
              <div className="flex items-center gap-3"><span className="w-5 h-3 bg-[#f0fdf4] border border-[#16a34a] rounded" /> Écran Moniteur</div>
              <div className="flex items-center gap-3"><span className="w-5 h-3 bg-[#f3f4f6] border border-[#4b5563] rounded" /> Caméra IP</div>
              <div className="flex items-center gap-3"><span className="w-5 h-3 bg-[#f3f4f6] border border-[#9ca3af] rounded" /> Autre Équipement</div>
            </div>
          </div>

          <div className="p-4 bg-brand-green-50 rounded-2xl border border-brand-green-100/60 print:hidden">
            <p className="text-xs font-bold text-brand-green-900 flex items-center gap-1.5 mb-1">
              <Info size={14} /> Conseil d'architecture :
            </p>
            <p className="text-[11px] text-brand-green-700 leading-relaxed font-medium">
              Glissez librement les éléments à l'écran pour cartographier vos bâtiments. Exportez ensuite le PDF pour l'associer à vos offres de prix !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopologyPlanner;