// ==================== Flowchart Gallery (Premium) ====================

// Password hash (SHA-256 of the actual password)
// Default password: "research2026" — change by updating this hash
const FC_PASSWORD_HASH = '5a8dd3ad0756a93ded72b823b19dd877115c5f6958f3cf527f3a0e006cb05940';

const flowchartData = [
    {
        id: 'fc-fl-training',
        title: 'Federated Learning Training Pipeline',
        journal: 'General Architecture',
        field: 'AI/ML',
        authors: 'Classic FL',
        tags: ['Federated Learning', 'Distributed', 'Privacy'],
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" font-family="Arial,sans-serif">
<defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#667eea"/><stop offset="100%" stop-color="#764ba2"/></linearGradient>
<linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f093fb"/><stop offset="100%" stop-color="#f5576c"/></linearGradient>
<linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#4facfe"/><stop offset="100%" stop-color="#00f2fe"/></linearGradient></defs>
<rect width="900" height="500" fill="#f8f9ff" rx="12"/>
<text x="450" y="35" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">Federated Learning Training Pipeline</text>
<rect x="350" y="55" width="200" height="50" rx="10" fill="url(#g1)"/><text x="450" y="85" text-anchor="middle" fill="#fff" font-size="13" font-weight="bold">Global Server</text>
<rect x="350" y="115" width="200" height="40" rx="8" fill="#e8ecff" stroke="#667eea" stroke-width="1.5"/><text x="450" y="140" text-anchor="middle" fill="#667eea" font-size="12">Global Model W(t)</text>
<line x1="450" y1="155" x2="450" y2="175" stroke="#667eea" stroke-width="2" marker-end="url(#arrow)"/>
<text x="450" y="190" text-anchor="middle" fill="#999" font-size="11">Distribute</text>
<path d="M450,195 L150,230" stroke="#667eea" stroke-width="1.5" stroke-dasharray="5,3"/>
<path d="M450,195 L450,230" stroke="#667eea" stroke-width="1.5" stroke-dasharray="5,3"/>
<path d="M450,195 L750,230" stroke="#667eea" stroke-width="1.5" stroke-dasharray="5,3"/>
<rect x="60" y="230" width="180" height="120" rx="10" fill="#fff" stroke="#4facfe" stroke-width="2"/><text x="150" y="255" text-anchor="middle" fill="#4facfe" font-size="12" font-weight="bold">Client 1</text>
<rect x="80" y="265" width="140" height="25" rx="5" fill="#e8f4ff"/><text x="150" y="282" text-anchor="middle" fill="#4facfe" font-size="10">Local Data D₁</text>
<rect x="80" y="295" width="140" height="25" rx="5" fill="#e8f4ff"/><text x="150" y="312" text-anchor="middle" fill="#4facfe" font-size="10">Train: W₁ = W - η∇L₁</text>
<rect x="80" y="325" width="140" height="20" rx="5" fill="url(#g3)"/><text x="150" y="339" text-anchor="middle" fill="#fff" font-size="9">Upload ΔW₁</text>
<rect x="360" y="230" width="180" height="120" rx="10" fill="#fff" stroke="#f5576c" stroke-width="2"/><text x="450" y="255" text-anchor="middle" fill="#f5576c" font-size="12" font-weight="bold">Client 2</text>
<rect x="380" y="265" width="140" height="25" rx="5" fill="#fff0f3"/><text x="450" y="282" text-anchor="middle" fill="#f5576c" font-size="10">Local Data D₂</text>
<rect x="380" y="295" width="140" height="25" rx="5" fill="#fff0f3"/><text x="450" y="312" text-anchor="middle" fill="#f5576c" font-size="10">Train: W₂ = W - η∇L₂</text>
<rect x="380" y="325" width="140" height="20" rx="5" fill="url(#g2)"/><text x="450" y="339" text-anchor="middle" fill="#fff" font-size="9">Upload ΔW₂</text>
<rect x="660" y="230" width="180" height="120" rx="10" fill="#fff" stroke="#2ecc71" stroke-width="2"/><text x="750" y="255" text-anchor="middle" fill="#2ecc71" font-size="12" font-weight="bold">Client N</text>
<rect x="680" y="265" width="140" height="25" rx="5" fill="#e8fff0"/><text x="750" y="282" text-anchor="middle" fill="#2ecc71" font-size="10">Local Data Dₙ</text>
<rect x="680" y="295" width="140" height="25" rx="5" fill="#e8fff0"/><text x="750" y="312" text-anchor="middle" fill="#2ecc71" font-size="10">Train: Wₙ = W - η∇Lₙ</text>
<rect x="680" y="325" width="140" height="20" rx="5" fill="#2ecc71"/><text x="750" y="339" text-anchor="middle" fill="#fff" font-size="9">Upload ΔWₙ</text>
<path d="M150,350 L150,390 L450,390" stroke="#4facfe" stroke-width="1.5" stroke-dasharray="5,3"/>
<path d="M450,350 L450,390" stroke="#f5576c" stroke-width="1.5" stroke-dasharray="5,3"/>
<path d="M750,350 L750,390 L450,390" stroke="#2ecc71" stroke-width="1.5" stroke-dasharray="5,3"/>
<text x="450" y="385" text-anchor="middle" fill="#999" font-size="11">Aggregate</text>
<rect x="310" y="400" width="280" height="45" rx="10" fill="url(#g1)"/><text x="450" y="420" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">FedAvg Aggregation</text><text x="450" y="436" text-anchor="middle" fill="#ddd" font-size="10">W(t+1) = Σ(nₖ/n)·Wₖ</text>
<path d="M450,445 L450,475 L520,475" stroke="#667eea" stroke-width="2"/>
<text x="600" y="480" text-anchor="middle" fill="#667eea" font-size="11" font-weight="bold">→ Next Round t+1</text>
</svg>`
    },
    {
        id: 'fc-iov-ids',
        title: 'IoV Intrusion Detection System Architecture',
        journal: 'IEEE IoT Journal',
        field: 'Security',
        authors: 'IoV Security',
        tags: ['IoV', 'Intrusion Detection', 'CAN Bus', 'Edge'],
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 480" font-family="Arial,sans-serif">
<rect width="900" height="480" fill="#f8f9ff" rx="12"/>
<text x="450" y="35" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">IoV Intrusion Detection System</text>
<rect x="30" y="60" width="160" height="160" rx="12" fill="#fff" stroke="#e74c3c" stroke-width="2"/>
<text x="110" y="85" text-anchor="middle" fill="#e74c3c" font-size="13" font-weight="bold">Vehicle Layer</text>
<rect x="45" y="95" width="130" height="30" rx="6" fill="#ffeaea"/><text x="110" y="115" text-anchor="middle" fill="#e74c3c" font-size="10">CAN Bus Traffic</text>
<rect x="45" y="130" width="130" height="30" rx="6" fill="#ffeaea"/><text x="110" y="150" text-anchor="middle" fill="#e74c3c" font-size="10">OBD-II Data</text>
<rect x="45" y="165" width="130" height="30" rx="6" fill="#ffeaea"/><text x="110" y="185" text-anchor="middle" fill="#e74c3c" font-size="10">V2X Messages</text>
<path d="M190,140 L250,140" stroke="#e74c3c" stroke-width="2" marker-end="url(#arr)"/>
<rect x="250" y="60" width="180" height="160" rx="12" fill="#fff" stroke="#f39c12" stroke-width="2"/>
<text x="340" y="85" text-anchor="middle" fill="#f39c12" font-size="13" font-weight="bold">Preprocessing</text>
<rect x="265" y="100" width="150" height="28" rx="6" fill="#fff8e6"/><text x="340" y="119" text-anchor="middle" fill="#f39c12" font-size="10">Feature Extraction</text>
<rect x="265" y="135" width="150" height="28" rx="6" fill="#fff8e6"/><text x="340" y="154" text-anchor="middle" fill="#f39c12" font-size="10">Traffic → Image (3ch)</text>
<rect x="265" y="170" width="150" height="28" rx="6" fill="#fff8e6"/><text x="340" y="189" text-anchor="middle" fill="#f39c12" font-size="10">Normalization</text>
<path d="M430,140 L490,140" stroke="#f39c12" stroke-width="2"/>
<rect x="490" y="60" width="180" height="160" rx="12" fill="#fff" stroke="#667eea" stroke-width="2"/>
<text x="580" y="85" text-anchor="middle" fill="#667eea" font-size="13" font-weight="bold">Edge IDS Model</text>
<rect x="505" y="100" width="150" height="28" rx="6" fill="#e8ecff"/><text x="580" y="119" text-anchor="middle" fill="#667eea" font-size="10">Lightweight CNN</text>
<rect x="505" y="135" width="150" height="28" rx="6" fill="#e8ecff"/><text x="580" y="154" text-anchor="middle" fill="#667eea" font-size="10">Pruning + INT8 Quant</text>
<rect x="505" y="170" width="150" height="28" rx="6" fill="#e8ecff"/><text x="580" y="189" text-anchor="middle" fill="#667eea" font-size="10">MCU Deployment</text>
<path d="M670,140 L730,140" stroke="#667eea" stroke-width="2"/>
<rect x="710" y="80" width="160" height="100" rx="12" fill="#fff" stroke="#2ecc71" stroke-width="2"/>
<text x="790" y="108" text-anchor="middle" fill="#2ecc71" font-size="13" font-weight="bold">Decision</text>
<rect x="725" y="120" width="55" height="40" rx="8" fill="#e8fff0"/><text x="753" y="145" text-anchor="middle" fill="#2ecc71" font-size="11">Normal</text>
<rect x="790" y="120" width="65" height="40" rx="8" fill="#ffeaea"/><text x="823" y="145" text-anchor="middle" fill="#e74c3c" font-size="11">Attack!</text>
<rect x="100" y="280" width="700" height="55" rx="10" fill="linear-gradient(90deg,#667eea,#764ba2)" style="fill:url(#g4)"/>
<defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%"><stop offset="0%" stop-color="#667eea"/><stop offset="100%" stop-color="#764ba2"/></linearGradient></defs>
<rect x="100" y="280" width="700" height="55" rx="10" fill="url(#g4)"/>
<text x="450" y="305" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">Federated Learning Aggregation Layer</text>
<text x="450" y="325" text-anchor="middle" fill="#ddd" font-size="11">Privacy-preserving model updates across vehicles</text>
<rect x="50" y="370" width="170" height="90" rx="10" fill="#fff" stroke="#9b59b6" stroke-width="2"/>
<text x="135" y="395" text-anchor="middle" fill="#9b59b6" font-size="11" font-weight="bold">RSU Node 1</text>
<rect x="65" y="405" width="140" height="20" rx="4" fill="#f3e8ff"/><text x="135" y="419" text-anchor="middle" fill="#9b59b6" font-size="9">Local Model Train</text>
<rect x="65" y="430" width="140" height="20" rx="4" fill="#f3e8ff"/><text x="135" y="444" text-anchor="middle" fill="#9b59b6" font-size="9">Upload Gradients</text>
<rect x="280" y="370" width="170" height="90" rx="10" fill="#fff" stroke="#9b59b6" stroke-width="2"/>
<text x="365" y="395" text-anchor="middle" fill="#9b59b6" font-size="11" font-weight="bold">RSU Node 2</text>
<rect x="295" y="405" width="140" height="20" rx="4" fill="#f3e8ff"/><text x="365" y="419" text-anchor="middle" fill="#9b59b6" font-size="9">Local Model Train</text>
<rect x="295" y="430" width="140" height="20" rx="4" fill="#f3e8ff"/><text x="365" y="444" text-anchor="middle" fill="#9b59b6" font-size="9">Upload Gradients</text>
<rect x="510" y="370" width="170" height="90" rx="10" fill="#fff" stroke="#9b59b6" stroke-width="2"/>
<text x="595" y="395" text-anchor="middle" fill="#9b59b6" font-size="11" font-weight="bold">RSU Node 3</text>
<rect x="525" y="405" width="140" height="20" rx="4" fill="#f3e8ff"/><text x="595" y="419" text-anchor="middle" fill="#9b59b6" font-size="9">Local Model Train</text>
<rect x="525" y="430" width="140" height="20" rx="4" fill="#f3e8ff"/><text x="595" y="444" text-anchor="middle" fill="#9b59b6" font-size="9">Upload Gradients</text>
<rect x="720" y="370" width="150" height="90" rx="10" fill="#fff" stroke="#1abc9c" stroke-width="2"/>
<text x="795" y="395" text-anchor="middle" fill="#1abc9c" font-size="11" font-weight="bold">Cloud Server</text>
<rect x="735" y="410" width="120" height="40" rx="6" fill="#e8fff8"/><text x="795" y="427" text-anchor="middle" fill="#1abc9c" font-size="9">FedAvg</text><text x="795" y="442" text-anchor="middle" fill="#1abc9c" font-size="9">Global Update</text>
<line x1="135" y1="370" x2="135" y2="335" stroke="#9b59b6" stroke-width="1.5" stroke-dasharray="4,3"/>
<line x1="365" y1="370" x2="365" y2="335" stroke="#9b59b6" stroke-width="1.5" stroke-dasharray="4,3"/>
<line x1="595" y1="370" x2="595" y2="335" stroke="#9b59b6" stroke-width="1.5" stroke-dasharray="4,3"/>
<line x1="795" y1="370" x2="795" y2="335" stroke="#1abc9c" stroke-width="1.5" stroke-dasharray="4,3"/>
</svg>`
    },
    {
        id: 'fc-tinyml-deploy',
        title: 'TinyML Model Deployment Pipeline',
        journal: 'Edge AI',
        field: 'AI/ML',
        authors: 'TinyML',
        tags: ['TinyML', 'Model Compression', 'MCU', 'Edge Deployment'],
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 360" font-family="Arial,sans-serif">
<rect width="900" height="360" fill="#f8f9ff" rx="12"/>
<text x="450" y="30" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">TinyML Deployment Pipeline</text>
<rect x="30" y="55" width="140" height="80" rx="10" fill="#667eea"/><text x="100" y="90" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">Full Model</text><text x="100" y="110" text-anchor="middle" fill="#ddd" font-size="10">ResNet / BERT</text><text x="100" y="125" text-anchor="middle" fill="#ddd" font-size="9">~100MB</text>
<path d="M170,95 L210,95" stroke="#667eea" stroke-width="2"/><text x="190" y="88" text-anchor="middle" fill="#999" font-size="9">→</text>
<rect x="210" y="55" width="140" height="80" rx="10" fill="#fff" stroke="#f39c12" stroke-width="2"/><text x="280" y="82" text-anchor="middle" fill="#f39c12" font-size="11" font-weight="bold">Knowledge</text><text x="280" y="98" text-anchor="middle" fill="#f39c12" font-size="11" font-weight="bold">Distillation</text><text x="280" y="118" text-anchor="middle" fill="#999" font-size="9">Teacher → Student</text>
<path d="M350,95 L390,95" stroke="#f39c12" stroke-width="2"/>
<rect x="390" y="55" width="140" height="80" rx="10" fill="#fff" stroke="#e74c3c" stroke-width="2"/><text x="460" y="82" text-anchor="middle" fill="#e74c3c" font-size="11" font-weight="bold">Structured</text><text x="460" y="98" text-anchor="middle" fill="#e74c3c" font-size="11" font-weight="bold">Pruning</text><text x="460" y="118" text-anchor="middle" fill="#999" font-size="9">Remove 70-90%</text>
<path d="M530,95 L570,95" stroke="#e74c3c" stroke-width="2"/>
<rect x="570" y="55" width="140" height="80" rx="10" fill="#fff" stroke="#9b59b6" stroke-width="2"/><text x="640" y="82" text-anchor="middle" fill="#9b59b6" font-size="11" font-weight="bold">INT8</text><text x="640" y="98" text-anchor="middle" fill="#9b59b6" font-size="11" font-weight="bold">Quantization</text><text x="640" y="118" text-anchor="middle" fill="#999" font-size="9">FP32 → INT8</text>
<path d="M710,95 L750,95" stroke="#9b59b6" stroke-width="2"/>
<rect x="750" y="55" width="120" height="80" rx="10" fill="#2ecc71"/><text x="810" y="88" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">Tiny Model</text><text x="810" y="108" text-anchor="middle" fill="#ddd" font-size="10">32-128KB</text><text x="810" y="123" text-anchor="middle" fill="#ddd" font-size="9">&lt;5ms latency</text>
<rect x="100" y="180" width="700" height="35" rx="8" fill="#e8ecff" stroke="#667eea" stroke-width="1"/>
<text x="450" y="203" text-anchor="middle" fill="#667eea" font-size="12" font-weight="bold">TensorFlow Lite Micro / ONNX Runtime / TVM</text>
<rect x="60" y="250" width="150" height="80" rx="10" fill="#fff" stroke="#3498db" stroke-width="2"/><text x="135" y="275" text-anchor="middle" fill="#3498db" font-size="11" font-weight="bold">STM32H7</text><text x="135" y="295" text-anchor="middle" fill="#999" font-size="9">ARM Cortex-M7</text><text x="135" y="310" text-anchor="middle" fill="#999" font-size="9">512KB RAM</text>
<rect x="260" y="250" width="150" height="80" rx="10" fill="#fff" stroke="#e67e22" stroke-width="2"/><text x="335" y="275" text-anchor="middle" fill="#e67e22" font-size="11" font-weight="bold">ESP32-S3</text><text x="335" y="295" text-anchor="middle" fill="#999" font-size="9">Xtensa LX7</text><text x="335" y="310" text-anchor="middle" fill="#999" font-size="9">512KB + PSRAM</text>
<rect x="460" y="250" width="150" height="80" rx="10" fill="#fff" stroke="#2ecc71" stroke-width="2"/><text x="535" y="275" text-anchor="middle" fill="#2ecc71" font-size="11" font-weight="bold">RPi Pico</text><text x="535" y="295" text-anchor="middle" fill="#999" font-size="9">ARM Cortex-M0+</text><text x="535" y="310" text-anchor="middle" fill="#999" font-size="9">264KB RAM</text>
<rect x="660" y="250" width="170" height="80" rx="10" fill="#fff" stroke="#9b59b6" stroke-width="2"/><text x="745" y="275" text-anchor="middle" fill="#9b59b6" font-size="11" font-weight="bold">Arduino Nano 33</text><text x="745" y="295" text-anchor="middle" fill="#999" font-size="9">ARM Cortex-M4F</text><text x="745" y="310" text-anchor="middle" fill="#999" font-size="9">256KB RAM</text>
<line x1="135" y1="250" x2="135" y2="215" stroke="#3498db" stroke-width="1.5" stroke-dasharray="4,3"/>
<line x1="335" y1="250" x2="335" y2="215" stroke="#e67e22" stroke-width="1.5" stroke-dasharray="4,3"/>
<line x1="535" y1="250" x2="535" y2="215" stroke="#2ecc71" stroke-width="1.5" stroke-dasharray="4,3"/>
<line x1="745" y1="250" x2="745" y2="215" stroke="#9b59b6" stroke-width="1.5" stroke-dasharray="4,3"/>
</svg>`
    },
    {
        id: 'fc-vpp-architecture',
        title: 'Virtual Power Plant System Architecture',
        journal: 'Applied Energy',
        field: 'VPP',
        authors: 'VPP System',
        tags: ['Virtual Power Plant', 'DER', 'Energy Management', 'Smart Grid'],
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 420" font-family="Arial,sans-serif">
<rect width="900" height="420" fill="#f8f9ff" rx="12"/>
<text x="450" y="32" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">Virtual Power Plant Architecture</text>
<rect x="320" y="50" width="260" height="60" rx="12" fill="#667eea"/><text x="450" y="78" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">VPP Control Center</text><text x="450" y="98" text-anchor="middle" fill="#ddd" font-size="10">Aggregation · Optimization · Market Bidding</text>
<line x1="200" y1="110" x2="200" y2="145" stroke="#667eea" stroke-width="1.5" stroke-dasharray="4,3"/>
<line x1="450" y1="110" x2="450" y2="145" stroke="#667eea" stroke-width="1.5" stroke-dasharray="4,3"/>
<line x1="700" y1="110" x2="700" y2="145" stroke="#667eea" stroke-width="1.5" stroke-dasharray="4,3"/>
<line x1="200" y1="110" x2="700" y2="110" stroke="#667eea" stroke-width="1.5"/>
<rect x="100" y="145" width="200" height="50" rx="8" fill="#fff" stroke="#f39c12" stroke-width="2"/><text x="200" y="167" text-anchor="middle" fill="#f39c12" font-size="12" font-weight="bold">Solar PV Array</text><text x="200" y="184" text-anchor="middle" fill="#999" font-size="9">Distributed Generation</text>
<rect x="350" y="145" width="200" height="50" rx="8" fill="#fff" stroke="#2ecc71" stroke-width="2"/><text x="450" y="167" text-anchor="middle" fill="#2ecc71" font-size="12" font-weight="bold">Wind Turbines</text><text x="450" y="184" text-anchor="middle" fill="#999" font-size="9">Renewable Energy</text>
<rect x="600" y="145" width="200" height="50" rx="8" fill="#fff" stroke="#3498db" stroke-width="2"/><text x="700" y="167" text-anchor="middle" fill="#3498db" font-size="12" font-weight="bold">Battery Storage</text><text x="700" y="184" text-anchor="middle" fill="#999" font-size="9">ESS / V2G</text>
<rect x="50" y="235" width="250" height="130" rx="10" fill="#fff" stroke="#e74c3c" stroke-width="2"/>
<text x="175" y="260" text-anchor="middle" fill="#e74c3c" font-size="13" font-weight="bold">FL-based Forecasting</text>
<rect x="65" y="270" width="220" height="25" rx="5" fill="#ffeaea"/><text x="175" y="287" text-anchor="middle" fill="#e74c3c" font-size="10">Load Prediction (LSTM)</text>
<rect x="65" y="300" width="220" height="25" rx="5" fill="#ffeaea"/><text x="175" y="317" text-anchor="middle" fill="#e74c3c" font-size="10">Solar/Wind Forecast (Transformer)</text>
<rect x="65" y="330" width="220" height="25" rx="5" fill="#ffeaea"/><text x="175" y="347" text-anchor="middle" fill="#e74c3c" font-size="10">Privacy: FedAvg + Diff Privacy</text>
<rect x="330" y="235" width="240" height="130" rx="10" fill="#fff" stroke="#9b59b6" stroke-width="2"/>
<text x="450" y="260" text-anchor="middle" fill="#9b59b6" font-size="13" font-weight="bold">DRL Optimization</text>
<rect x="345" y="270" width="210" height="25" rx="5" fill="#f3e8ff"/><text x="450" y="287" text-anchor="middle" fill="#9b59b6" font-size="10">Multi-Agent DRL Scheduling</text>
<rect x="345" y="300" width="210" height="25" rx="5" fill="#f3e8ff"/><text x="450" y="317" text-anchor="middle" fill="#9b59b6" font-size="10">Cost Minimization</text>
<rect x="345" y="330" width="210" height="25" rx="5" fill="#f3e8ff"/><text x="450" y="347" text-anchor="middle" fill="#9b59b6" font-size="10">Carbon Emission Reduction</text>
<rect x="600" y="235" width="250" height="130" rx="10" fill="#fff" stroke="#1abc9c" stroke-width="2"/>
<text x="725" y="260" text-anchor="middle" fill="#1abc9c" font-size="13" font-weight="bold">Market Interface</text>
<rect x="615" y="270" width="220" height="25" rx="5" fill="#e8fff8"/><text x="725" y="287" text-anchor="middle" fill="#1abc9c" font-size="10">Day-Ahead Bidding</text>
<rect x="615" y="300" width="220" height="25" rx="5" fill="#e8fff8"/><text x="725" y="317" text-anchor="middle" fill="#1abc9c" font-size="10">Real-Time Balancing</text>
<rect x="615" y="330" width="220" height="25" rx="5" fill="#e8fff8"/><text x="725" y="347" text-anchor="middle" fill="#1abc9c" font-size="10">Demand Response</text>
<rect x="200" y="390" width="500" height="25" rx="6" fill="#e8ecff" stroke="#667eea" stroke-width="1"/><text x="450" y="408" text-anchor="middle" fill="#667eea" font-size="11" font-weight="bold">Electricity Market / Grid Operator / ISO</text>
</svg>`
    },
    {
        id: 'fc-cnn-architecture',
        title: 'Convolutional Neural Network Architecture',
        journal: 'Classic Architecture',
        field: 'AI/ML',
        authors: 'Deep Learning',
        tags: ['CNN', 'Deep Learning', 'Classification', 'Feature Extraction'],
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 320" font-family="Arial,sans-serif">
<rect width="900" height="320" fill="#f8f9ff" rx="12"/>
<text x="450" y="30" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">CNN Architecture for Image Classification</text>
<rect x="20" y="80" width="80" height="160" rx="6" fill="#3498db" opacity="0.8"/><rect x="28" y="88" width="80" height="160" rx="6" fill="#3498db" opacity="0.6"/><rect x="36" y="96" width="80" height="160" rx="6" fill="#3498db" opacity="0.4"/>
<text x="68" y="280" text-anchor="middle" fill="#3498db" font-size="11" font-weight="bold">Input</text><text x="68" y="295" text-anchor="middle" fill="#999" font-size="9">224×224×3</text>
<path d="M120,170 L155,170" stroke="#999" stroke-width="1.5"/>
<rect x="155" y="100" width="55" height="140" rx="6" fill="#e74c3c" opacity="0.7"/><rect x="162" y="107" width="55" height="140" rx="6" fill="#e74c3c" opacity="0.5"/>
<text x="186" y="280" text-anchor="middle" fill="#e74c3c" font-size="10" font-weight="bold">Conv1</text><text x="186" y="293" text-anchor="middle" fill="#999" font-size="8">64 filters</text>
<path d="M220,170 L245,170" stroke="#999" stroke-width="1.5"/>
<rect x="245" y="115" width="45" height="110" rx="6" fill="#f39c12" opacity="0.7"/>
<text x="268" y="280" text-anchor="middle" fill="#f39c12" font-size="10" font-weight="bold">Pool1</text><text x="268" y="293" text-anchor="middle" fill="#999" font-size="8">2×2</text>
<path d="M293,170 L320,170" stroke="#999" stroke-width="1.5"/>
<rect x="320" y="120" width="50" height="100" rx="6" fill="#e74c3c" opacity="0.7"/><rect x="327" y="125" width="50" height="100" rx="6" fill="#e74c3c" opacity="0.5"/><rect x="334" y="130" width="50" height="100" rx="6" fill="#e74c3c" opacity="0.35"/>
<text x="352" y="280" text-anchor="middle" fill="#e74c3c" font-size="10" font-weight="bold">Conv2</text><text x="352" y="293" text-anchor="middle" fill="#999" font-size="8">128 filters</text>
<path d="M388,170 L415,170" stroke="#999" stroke-width="1.5"/>
<rect x="415" y="135" width="40" height="70" rx="6" fill="#f39c12" opacity="0.7"/>
<text x="435" y="280" text-anchor="middle" fill="#f39c12" font-size="10" font-weight="bold">Pool2</text>
<path d="M458,170 L485,170" stroke="#999" stroke-width="1.5"/>
<rect x="485" y="140" width="45" height="60" rx="6" fill="#e74c3c" opacity="0.7"/><rect x="491" y="144" width="45" height="60" rx="6" fill="#e74c3c" opacity="0.5"/><rect x="497" y="148" width="45" height="60" rx="6" fill="#e74c3c" opacity="0.35"/><rect x="503" y="152" width="45" height="60" rx="6" fill="#e74c3c" opacity="0.2"/>
<text x="517" y="280" text-anchor="middle" fill="#e74c3c" font-size="10" font-weight="bold">Conv3</text><text x="517" y="293" text-anchor="middle" fill="#999" font-size="8">256 filters</text>
<path d="M552,170 L575,170" stroke="#999" stroke-width="1.5"/>
<rect x="575" y="155" width="30" height="30" rx="4" fill="#2ecc71"/><text x="590" y="280" text-anchor="middle" fill="#2ecc71" font-size="10" font-weight="bold">Flatten</text>
<path d="M608,170 L635,170" stroke="#999" stroke-width="1.5"/>
<g><circle cx="645" cy="130" r="8" fill="#9b59b6" opacity="0.6"/><circle cx="645" cy="150" r="8" fill="#9b59b6" opacity="0.6"/><circle cx="645" cy="170" r="8" fill="#9b59b6" opacity="0.6"/><circle cx="645" cy="190" r="8" fill="#9b59b6" opacity="0.6"/><circle cx="645" cy="210" r="8" fill="#9b59b6" opacity="0.6"/>
<circle cx="700" cy="140" r="8" fill="#9b59b6" opacity="0.6"/><circle cx="700" cy="165" r="8" fill="#9b59b6" opacity="0.6"/><circle cx="700" cy="190" r="8" fill="#9b59b6" opacity="0.6"/>
<line x1="653" y1="130" x2="692" y2="140" stroke="#9b59b6" stroke-width="0.5" opacity="0.3"/><line x1="653" y1="150" x2="692" y2="165" stroke="#9b59b6" stroke-width="0.5" opacity="0.3"/><line x1="653" y1="170" x2="692" y2="165" stroke="#9b59b6" stroke-width="0.5" opacity="0.3"/><line x1="653" y1="190" x2="692" y2="190" stroke="#9b59b6" stroke-width="0.5" opacity="0.3"/><line x1="653" y1="210" x2="692" y2="190" stroke="#9b59b6" stroke-width="0.5" opacity="0.3"/></g>
<text x="670" y="280" text-anchor="middle" fill="#9b59b6" font-size="10" font-weight="bold">FC 512</text>
<text x="700" y="280" text-anchor="middle" fill="#9b59b6" font-size="10" font-weight="bold"> </text>
<path d="M712,165 L745,165" stroke="#999" stroke-width="1.5"/>
<rect x="745" y="125" width="30" height="90" rx="6" fill="#667eea"/>
<text x="760" y="280" text-anchor="middle" fill="#667eea" font-size="10" font-weight="bold">Dropout</text><text x="760" y="293" text-anchor="middle" fill="#999" font-size="8">0.5</text>
<path d="M778,170 L810,170" stroke="#999" stroke-width="1.5"/>
<g><circle cx="825" cy="145" r="10" fill="#2ecc71"/><circle cx="825" cy="175" r="10" fill="#e74c3c"/><circle cx="825" cy="205" r="10" fill="#f39c12"/></g>
<text x="825" y="280" text-anchor="middle" fill="#333" font-size="10" font-weight="bold">Softmax</text><text x="825" y="293" text-anchor="middle" fill="#999" font-size="8">N classes</text>
<text x="862" y="148" fill="#2ecc71" font-size="9">Cat</text><text x="862" y="178" fill="#e74c3c" font-size="9">Dog</text><text x="862" y="208" fill="#f39c12" font-size="9">...</text>
</svg>`
    },
    {
        id: 'fc-transformer',
        title: 'Transformer Architecture (Attention Is All You Need)',
        journal: 'NeurIPS 2017',
        field: 'AI/ML',
        authors: 'Vaswani et al.',
        tags: ['Transformer', 'Self-Attention', 'NLP', 'Deep Learning'],
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 500" font-family="Arial,sans-serif">
<rect width="700" height="500" fill="#f8f9ff" rx="12"/>
<text x="350" y="30" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">Transformer Architecture</text>
<rect x="60" y="50" width="250" height="400" rx="12" fill="#fff" stroke="#667eea" stroke-width="2"/>
<text x="185" y="75" text-anchor="middle" fill="#667eea" font-size="14" font-weight="bold">Encoder (×N)</text>
<rect x="85" y="90" width="200" height="40" rx="8" fill="#e8ecff" stroke="#667eea" stroke-width="1"/><text x="185" y="115" text-anchor="middle" fill="#667eea" font-size="11">Multi-Head Attention</text>
<rect x="85" y="140" width="200" height="25" rx="6" fill="#f0f0f0"/><text x="185" y="157" text-anchor="middle" fill="#999" font-size="10">Add & Norm</text>
<rect x="85" y="175" width="200" height="40" rx="8" fill="#e8ecff" stroke="#667eea" stroke-width="1"/><text x="185" y="200" text-anchor="middle" fill="#667eea" font-size="11">Feed Forward</text>
<rect x="85" y="225" width="200" height="25" rx="6" fill="#f0f0f0"/><text x="185" y="242" text-anchor="middle" fill="#999" font-size="10">Add & Norm</text>
<rect x="85" y="280" width="200" height="35" rx="8" fill="#fff8e6" stroke="#f39c12" stroke-width="1"/><text x="185" y="303" text-anchor="middle" fill="#f39c12" font-size="11">Positional Encoding</text>
<rect x="105" y="330" width="160" height="35" rx="8" fill="#e8fff0" stroke="#2ecc71" stroke-width="1"/><text x="185" y="352" text-anchor="middle" fill="#2ecc71" font-size="11">Input Embedding</text>
<rect x="120" y="400" width="130" height="30" rx="6" fill="#2ecc71"/><text x="185" y="420" text-anchor="middle" fill="#fff" font-size="11">Input Tokens</text>
<rect x="390" y="50" width="250" height="400" rx="12" fill="#fff" stroke="#e74c3c" stroke-width="2"/>
<text x="515" y="75" text-anchor="middle" fill="#e74c3c" font-size="14" font-weight="bold">Decoder (×N)</text>
<rect x="415" y="90" width="200" height="35" rx="8" fill="#ffeaea" stroke="#e74c3c" stroke-width="1"/><text x="515" y="113" text-anchor="middle" fill="#e74c3c" font-size="10">Masked Multi-Head Attention</text>
<rect x="415" y="133" width="200" height="22" rx="6" fill="#f0f0f0"/><text x="515" y="148" text-anchor="middle" fill="#999" font-size="9">Add & Norm</text>
<rect x="415" y="163" width="200" height="35" rx="8" fill="#ffeaea" stroke="#e74c3c" stroke-width="1"/><text x="515" y="185" text-anchor="middle" fill="#e74c3c" font-size="10">Cross Multi-Head Attention</text>
<rect x="415" y="206" width="200" height="22" rx="6" fill="#f0f0f0"/><text x="515" y="221" text-anchor="middle" fill="#999" font-size="9">Add & Norm</text>
<rect x="415" y="236" width="200" height="35" rx="8" fill="#ffeaea" stroke="#e74c3c" stroke-width="1"/><text x="515" y="258" text-anchor="middle" fill="#e74c3c" font-size="11">Feed Forward</text>
<rect x="415" y="279" width="200" height="22" rx="6" fill="#f0f0f0"/><text x="515" y="294" text-anchor="middle" fill="#999" font-size="9">Add & Norm</text>
<rect x="415" y="330" width="200" height="35" rx="8" fill="#fff8e6" stroke="#f39c12" stroke-width="1"/><text x="515" y="352" text-anchor="middle" fill="#f39c12" font-size="11">Positional Encoding</text>
<rect x="435" y="380" width="160" height="35" rx="8" fill="#e8fff0" stroke="#2ecc71" stroke-width="1"/><text x="515" y="402" text-anchor="middle" fill="#2ecc71" font-size="11">Output Embedding</text>
<rect x="450" y="430" width="130" height="30" rx="6" fill="#e74c3c"/><text x="515" y="450" text-anchor="middle" fill="#fff" font-size="11">Output Tokens</text>
<path d="M310,180 L415,180" stroke="#9b59b6" stroke-width="2" stroke-dasharray="5,3"/>
<text x="362" y="173" text-anchor="middle" fill="#9b59b6" font-size="9">K,V</text>
</svg>`
    },
    {
        id: 'fc-gan',
        title: 'Generative Adversarial Network (GAN)',
        journal: 'Classic Architecture',
        field: 'AI/ML',
        authors: 'Goodfellow et al.',
        tags: ['GAN', 'Generative Model', 'Deep Learning', 'Adversarial'],
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 350" font-family="Arial,sans-serif">
<rect width="800" height="350" fill="#f8f9ff" rx="12"/>
<text x="400" y="30" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">Generative Adversarial Network</text>
<rect x="30" y="120" width="120" height="80" rx="10" fill="#9b59b6"/><text x="90" y="155" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">Latent</text><text x="90" y="175" text-anchor="middle" fill="#ddd" font-size="10">z ~ N(0,1)</text>
<path d="M150,160 L195,160" stroke="#9b59b6" stroke-width="2"/>
<rect x="195" y="90" width="200" height="140" rx="12" fill="#fff" stroke="#2ecc71" stroke-width="2.5"/>
<text x="295" y="125" text-anchor="middle" fill="#2ecc71" font-size="14" font-weight="bold">Generator G</text>
<rect x="215" y="140" width="160" height="25" rx="5" fill="#e8fff0"/><text x="295" y="157" text-anchor="middle" fill="#2ecc71" font-size="10">Deconv / Upsample</text>
<rect x="215" y="172" width="160" height="25" rx="5" fill="#e8fff0"/><text x="295" y="189" text-anchor="middle" fill="#2ecc71" font-size="10">BatchNorm + ReLU</text>
<path d="M395,130 L445,130" stroke="#2ecc71" stroke-width="2"/>
<text x="420" y="123" text-anchor="middle" fill="#2ecc71" font-size="9">G(z)</text>
<text x="420" y="143" text-anchor="middle" fill="#999" font-size="8">Fake</text>
<rect x="30" y="260" width="120" height="50" rx="8" fill="#3498db"/><text x="90" y="290" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Real Data x</text>
<path d="M150,285 L445,285 L445,200" stroke="#3498db" stroke-width="2"/>
<text x="300" y="278" text-anchor="middle" fill="#3498db" font-size="9">Real</text>
<rect x="445" y="90" width="200" height="140" rx="12" fill="#fff" stroke="#e74c3c" stroke-width="2.5"/>
<text x="545" y="125" text-anchor="middle" fill="#e74c3c" font-size="14" font-weight="bold">Discriminator D</text>
<rect x="465" y="140" width="160" height="25" rx="5" fill="#ffeaea"/><text x="545" y="157" text-anchor="middle" fill="#e74c3c" font-size="10">Conv / Downsample</text>
<rect x="465" y="172" width="160" height="25" rx="5" fill="#ffeaea"/><text x="545" y="189" text-anchor="middle" fill="#e74c3c" font-size="10">LeakyReLU + Sigmoid</text>
<path d="M645,160 L700,160" stroke="#e74c3c" stroke-width="2"/>
<rect x="700" y="130" width="70" height="60" rx="10" fill="#f39c12"/><text x="735" y="155" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">Real?</text><text x="735" y="173" text-anchor="middle" fill="#fff" font-size="10">Fake?</text>
<path d="M545,230 L545,310 L295,310 L295,230" stroke="#667eea" stroke-width="2" stroke-dasharray="6,3" fill="none"/>
<text x="420" y="325" text-anchor="middle" fill="#667eea" font-size="11" font-weight="bold">Adversarial Loss: min_G max_D V(D,G)</text>
</svg>`
    },
    {
        id: 'fc-autoencoder',
        title: 'Variational AutoEncoder (VAE)',
        journal: 'Classic Architecture',
        field: 'AI/ML',
        authors: 'Kingma et al.',
        tags: ['AutoEncoder', 'VAE', 'Generative Model', 'Latent Space'],
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" font-family="Arial,sans-serif">
<rect width="800" height="300" fill="#f8f9ff" rx="12"/>
<text x="400" y="28" text-anchor="middle" font-size="18" font-weight="bold" fill="#333">Variational AutoEncoder (VAE)</text>
<rect x="20" y="90" width="100" height="120" rx="10" fill="#3498db"/><text x="70" y="145" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">Input x</text><text x="70" y="165" text-anchor="middle" fill="#ddd" font-size="9">28×28</text>
<path d="M120,150 L160,150" stroke="#3498db" stroke-width="2"/>
<rect x="160" y="65" width="180" height="170" rx="12" fill="#fff" stroke="#667eea" stroke-width="2"/>
<text x="250" y="90" text-anchor="middle" fill="#667eea" font-size="13" font-weight="bold">Encoder q(z|x)</text>
<rect x="178" y="100" width="144" height="25" rx="5" fill="#e8ecff"/><text x="250" y="117" text-anchor="middle" fill="#667eea" font-size="10">FC 784 → 400</text>
<rect x="178" y="132" width="144" height="25" rx="5" fill="#e8ecff"/><text x="250" y="149" text-anchor="middle" fill="#667eea" font-size="10">FC 400 → 200</text>
<rect x="178" y="170" width="68" height="28" rx="5" fill="#667eea"/><text x="212" y="189" text-anchor="middle" fill="#fff" font-size="9">μ</text>
<rect x="254" y="170" width="68" height="28" rx="5" fill="#667eea"/><text x="288" y="189" text-anchor="middle" fill="#fff" font-size="9">log σ²</text>
<path d="M340,150 L380,150" stroke="#667eea" stroke-width="2"/>
<rect x="380" y="105" width="80" height="90" rx="40" fill="#f39c12" opacity="0.15" stroke="#f39c12" stroke-width="2"/>
<text x="420" y="140" text-anchor="middle" fill="#f39c12" font-size="11" font-weight="bold">z</text>
<text x="420" y="158" text-anchor="middle" fill="#f39c12" font-size="9">Latent</text>
<text x="420" y="173" text-anchor="middle" fill="#f39c12" font-size="8">μ + σ·ε</text>
<text x="420" y="210" text-anchor="middle" fill="#999" font-size="8">ε ~ N(0,1)</text>
<path d="M460,150 L500,150" stroke="#f39c12" stroke-width="2"/>
<rect x="500" y="65" width="180" height="170" rx="12" fill="#fff" stroke="#2ecc71" stroke-width="2"/>
<text x="590" y="90" text-anchor="middle" fill="#2ecc71" font-size="13" font-weight="bold">Decoder p(x|z)</text>
<rect x="518" y="105" width="144" height="25" rx="5" fill="#e8fff0"/><text x="590" y="122" text-anchor="middle" fill="#2ecc71" font-size="10">FC 20 → 200</text>
<rect x="518" y="138" width="144" height="25" rx="5" fill="#e8fff0"/><text x="590" y="155" text-anchor="middle" fill="#2ecc71" font-size="10">FC 200 → 400</text>
<rect x="518" y="171" width="144" height="25" rx="5" fill="#e8fff0"/><text x="590" y="188" text-anchor="middle" fill="#2ecc71" font-size="10">FC 400 → 784</text>
<path d="M680,150 L720,150" stroke="#2ecc71" stroke-width="2"/>
<rect x="720" y="90" width="60" height="120" rx="10" fill="#2ecc71"/><text x="750" y="145" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">x̂</text><text x="750" y="163" text-anchor="middle" fill="#ddd" font-size="9">28×28</text>
<text x="400" y="275" text-anchor="middle" fill="#667eea" font-size="11" font-weight="bold">Loss = Reconstruction (BCE) + KL Divergence</text>
</svg>`
    }
];

// SHA-256 hash function
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function isFlowchartsUnlocked() {
    return localStorage.getItem('fc_unlocked') === 'true';
}

async function unlockFlowcharts() {
    const input = document.getElementById('fcPasswordInput');
    if (!input) return;
    const password = input.value.trim();
    if (!password) { showToast(t('fc.password.empty'), 'warning'); return; }

    const hash = await sha256(password);
    if (hash === FC_PASSWORD_HASH) {
        localStorage.setItem('fc_unlocked', 'true');
        input.value = '';
        updateLockUI();
        renderFlowcharts();
        showToast(t('fc.unlock.success'));
    } else {
        showToast(t('fc.unlock.fail'), 'error');
    }
}

function lockFlowcharts() {
    localStorage.removeItem('fc_unlocked');
    updateLockUI();
    renderFlowcharts();
    showToast(t('fc.lock.success'));
}

function updateLockUI() {
    const lockBar = document.getElementById('fcLockBar');
    const unlockedBar = document.getElementById('fcUnlockedBar');
    if (!lockBar || !unlockedBar) return;

    if (isFlowchartsUnlocked()) {
        lockBar.style.display = 'none';
        unlockedBar.style.display = 'flex';
    } else {
        lockBar.style.display = 'flex';
        unlockedBar.style.display = 'none';
    }
}

function renderFlowcharts() {
    const gallery = document.getElementById('fcGallery');
    if (!gallery) return;

    const fieldFilter = document.getElementById('fcFieldFilter');
    const field = fieldFilter ? fieldFilter.value : 'all';
    const unlocked = isFlowchartsUnlocked();

    let items = flowchartData;
    if (field !== 'all') {
        items = items.filter(fc => fc.field === field);
    }

    if (items.length === 0) {
        gallery.innerHTML = '<p class="preview-placeholder">' + t('fc.empty') + '</p>';
        return;
    }

    let html = '';
    items.forEach(fc => {
        html += '<div class="fc-card">';
        html += '<div class="fc-preview' + (unlocked ? '' : ' fc-blurred') + '">';
        html += fc.svg;
        if (!unlocked) {
            html += '<div class="fc-watermark">' + t('fc.watermark') + '</div>';
        }
        html += '</div>';
        html += '<div class="fc-info">';
        html += '<h4>' + fc.title + '</h4>';
        html += '<span class="fc-journal">' + fc.journal + '</span>';
        html += '<span class="fc-field">' + fc.field + '</span>';
        html += '</div>';
        html += '<div class="fc-actions">';
        if (unlocked) {
            html += '<button onclick="downloadFlowchartSvg(\'' + fc.id + '\')" data-i18n="fc.btn.downloadsvg">' + t('fc.btn.downloadsvg') + '</button>';
            html += '<button onclick="downloadFlowchartPng(\'' + fc.id + '\')" data-i18n="fc.btn.downloadpng">' + t('fc.btn.downloadpng') + '</button>';
        } else {
            html += '<button class="fc-btn-locked" onclick="showToast(t(\'fc.needunlock\'), \'warning\')" data-i18n="fc.btn.locked">' + t('fc.btn.locked') + '</button>';
        }
        html += '</div>';
        html += '</div>';
    });

    gallery.innerHTML = html;
}

function downloadFlowchartSvg(id) {
    const fc = flowchartData.find(f => f.id === id);
    if (!fc || !isFlowchartsUnlocked()) return;

    const blob = new Blob([fc.svg], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fc.id + '.svg';
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(t('alert.downloadSuccess'));
}

function downloadFlowchartPng(id) {
    const fc = flowchartData.find(f => f.id === id);
    if (!fc || !isFlowchartsUnlocked()) return;

    const container = document.createElement('div');
    container.innerHTML = fc.svg;
    const svgEl = container.querySelector('svg');
    if (!svgEl) return;

    const viewBox = svgEl.getAttribute('viewBox');
    let width = 800, height = 400;
    if (viewBox) {
        const parts = viewBox.split(/\s+/);
        width = parseFloat(parts[2]) || 800;
        height = parseFloat(parts[3]) || 400;
    }

    const scale = 2; // Retina
    const canvas = document.createElement('canvas');
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    const svgString = new XMLSerializer().serializeToString(svgEl);
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = function () {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);

        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = fc.id + '.png';
        a.click();
        showToast(t('alert.downloadSuccess'));
    };
    img.src = url;
}

// Handle Enter key in password input
document.addEventListener('DOMContentLoaded', function () {
    const pwInput = document.getElementById('fcPasswordInput');
    if (pwInput) {
        pwInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') unlockFlowcharts();
        });
    }
    updateLockUI();

    // Auto-render on section visit
    const fcSection = document.getElementById('flowcharts');
    if (fcSection) {
        const observer = new MutationObserver(function () {
            if (fcSection.classList.contains('active')) renderFlowcharts();
        });
        observer.observe(fcSection, { attributes: true, attributeFilter: ['class'] });
    }
});
