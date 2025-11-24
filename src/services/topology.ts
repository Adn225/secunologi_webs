import { CartItem } from '../types';

export interface TopologyLayer {
  key: string;
  title: string;
  description: string;
  items: CartItem[];
  guidance: string;
}

export interface TopologyPlan {
  summary: string;
  layers: TopologyLayer[];
  recommendations: string[];
  flow: string[];
  total: number;
}

const layerTemplates = [
  {
    key: 'core',
    title: 'Noyau & enregistrement',
    description: 'Serveurs, NVR/DVR et concentrateurs assurant le pilotage central.',
    guidance: 'Prévoir un emplacement ventilé et sécurisé pour le coeur de réseau.',
    keywords: ['nvr', 'dvr', 'serveur', 'server', 'gateway', 'controleur', 'contrôleur'],
  },
  {
    key: 'network',
    title: 'Réseau & distribution',
    description: 'Switchs, routeurs, bornes Wi-Fi et équipements PoE.',
    guidance: 'Séparer les flux vidéo et bureautiques quand c’est possible.',
    keywords: ['switch', 'routeur', 'router', 'wi-fi', 'wifi', 'poe', 'pare-feu', 'firewall'],
  },
  {
    key: 'edge',
    title: 'Capteurs & terminaux',
    description: 'Caméras, lecteurs, capteurs et périphériques de terrain.',
    guidance: 'Placer les équipements en étoile autour des points de concentration PoE.',
    keywords: ['caméra', 'camera', 'lecteur', 'badge', 'capteur', 'sirène', 'detecteur', 'détecteur'],
  },
  {
    key: 'power',
    title: 'Énergie & continuité',
    description: 'Onduleurs, alimentations, batteries et protections.',
    guidance: 'Raccorder le coeur de réseau et les switchs critiques à l’onduleur.',
    keywords: ['onduleur', 'ups', 'batterie', 'alimentation', 'psu', 'energy'],
  },
  {
    key: 'software',
    title: 'Supervision & services',
    description: 'Licences, plateformes cloud et logiciels de supervision.',
    guidance: 'Valider les compatibilités de licences avec le matériel sélectionné.',
    keywords: ['licence', 'license', 'logiciel', 'software', 'cloud', 'saas', 'service'],
  },
  {
    key: 'accessories',
    title: 'Câblage & accessoires',
    description: 'Câbles, baies, supports et petites fournitures.',
    guidance: 'Anticiper des longueurs supplémentaires pour les chemins de câbles.',
    keywords: ['câble', 'cable', 'rack', 'baie', 'support', 'bracket', 'boîtier', 'boitier'],
  },
] as const;

const normalizeText = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const matchesLayer = (text: string, keywords: readonly string[]) =>
  keywords.some(keyword => text.includes(keyword));

const formatCurrency = (amount: number) => `${new Intl.NumberFormat('fr-FR').format(amount)} FCFA`;

const escapePdfText = (value: string) => value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const buildContentStream = (plan: TopologyPlan) => {
  const lines: string[] = [];
  let currentY = 800;

  const addLine = (text: string, size = 12) => {
    const safeText = escapePdfText(text);
    lines.push(`BT /F1 ${size} Tf 50 ${currentY} Td (${safeText}) Tj ET`);
    currentY -= size + 4;
  };

  addLine('Topologie intelligente Secunologi', 16);
  addLine(`Généré le ${new Date().toLocaleString('fr-FR')}`, 10);
  addLine(plan.summary, 12);
  addLine('---', 10);

  plan.layers.forEach(layer => {
    addLine(layer.title, 13);
    addLine(layer.description, 10);
    layer.items.forEach(item => {
      addLine(`- ${item.quantity} x ${item.product.name}`, 10);
    });
    addLine(layer.guidance, 9);
    addLine('', 9);
  });

  if (plan.flow.length) {
    addLine('Chaîne de connexion recommandée :', 12);
    plan.flow.forEach(step => addLine(`• ${step}`, 10));
  }

  if (plan.recommendations.length) {
    addLine('Conseils complémentaires :', 12);
    plan.recommendations.forEach(rec => addLine(`• ${rec}`, 10));
  }

  addLine(`Budget estimé : ${formatCurrency(plan.total)}`, 12);
  return lines.join('\n');
};

const buildPdfBlob = (plan: TopologyPlan) => {
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  const addObject = (content: string) => {
    offsets.push(pdf.length);
    pdf += `${offsets.length - 1} 0 obj\n${content}\nendobj\n`;
  };

  const contentStream = buildContentStream(plan);

  addObject('<< /Type /Catalog /Pages 2 0 R >>');
  addObject('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObject('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>');
  addObject(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`);
  addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${offsets.length}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer << /Root 1 0 R /Size ${offsets.length} >>\n`;
  pdf += `startxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
};

const buildFlow = (layers: TopologyLayer[]) => {
  const hasEdge = layers.some(layer => layer.key === 'edge');
  const hasNetwork = layers.some(layer => layer.key === 'network');
  const hasCore = layers.some(layer => layer.key === 'core');
  const hasPower = layers.some(layer => layer.key === 'power');

  const flow: string[] = [];
  if (hasEdge && hasNetwork) {
    flow.push('Capteurs & terminaux → Switch/PoE → Noyau/serveur');
  }
  if (hasNetwork && hasCore) {
    flow.push('Réseau distribué → Enregistreur/NVR → Supervision');
  }
  if (hasPower) {
    flow.push('Onduleur → Coeur de réseau → Switchs → Périphériques');
  }
  return flow;
};

const buildRecommendations = (layers: TopologyLayer[]) => {
  const recommendations: string[] = [];
  const edgeLayer = layers.find(layer => layer.key === 'edge');
  const networkLayer = layers.find(layer => layer.key === 'network');
  const powerLayer = layers.find(layer => layer.key === 'power');

  if (edgeLayer) {
    recommendations.push('Vérifiez la couverture PoE et le débit par caméra/capteur.');
  }
  if (networkLayer) {
    recommendations.push('Prévoyez un VLAN dédié pour les flux critiques et l’accès distant sécurisé.');
  }
  if (powerLayer) {
    recommendations.push('Dimensionnez l’autonomie de l’onduleur selon la puissance cumulée des équipements.');
  }
  recommendations.push('Documentez les adresses IP, noms d’hôtes et plan d’adressage utilisé.');
  return recommendations;
};

export const buildTopologyPlan = (items: CartItem[], total: number): TopologyPlan => {
  const classified: Record<string, CartItem[]> = {};

  items.forEach(item => {
    const haystack = normalizeText(
      `${item.product.name} ${item.product.category} ${item.product.description ?? ''}`
    );
    const template = layerTemplates.find(layer => matchesLayer(haystack, layer.keywords));
    const key = template?.key ?? 'custom';
    if (!classified[key]) {
      classified[key] = [];
    }
    classified[key].push(item);
  });

  const layers: TopologyLayer[] = layerTemplates
    .map(template => ({ ...template, items: classified[template.key] ?? [] }))
    .filter(layer => layer.items.length > 0);

  if (classified.custom?.length) {
    layers.push({
      key: 'custom',
      title: 'Personnalisations',
      description: 'Éléments spécifiques à intégrer dans la topologie.',
      guidance: 'Valider l’interface (IP, alimentation, protocole) pour chaque élément personnalisé.',
      items: classified.custom,
    });
  }

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const summary = `${totalItems} équipement(s) réparti(s) sur ${layers.length} couche(s) — budget estimé ${formatCurrency(total)}`;

  const flow = buildFlow(layers);
  const recommendations = buildRecommendations(layers);

  return {
    summary,
    layers,
    recommendations,
    flow,
    total,
  };
};

export const createTopologyPdf = (plan: TopologyPlan) => buildPdfBlob(plan);
