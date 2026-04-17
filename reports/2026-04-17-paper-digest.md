# 每日论文速递 — 2026-04-17

共收录 **15** 篇论文，覆盖 6 个研究方向。对照 LCSMC-Net（Sensors 2026）：**9,401 参数 / 2.84M FLOPs / 99.89% 精度 / INT8: 3.6KB Flash + 3KB RAM + 5.6ms**。

---

## 方向1：联邦学习 + 车载入侵检测（3 篇）

### [pd-20260417-01] FedLiTeCAN: A Federated Lightweight Transformer for Fast and Robust CAN Bus Intrusion Detection

- **作者**: Zaher, M., et al.
- **发表**: arXiv  |  **分类**: Security  |  **arXiv**: `2512.24088`
- **链接**: https://arxiv.org/abs/2512.24088

**摘要**：提出联邦学习框架下的轻量化Transformer CAN总线入侵检测模型。以连接车辆为本地节点，聚合加密的模型权重而不共享原始CAN流量。在多种攻击类型上实现鲁棒检测且推理延迟显著低于标准Transformer。

**核心亮点**：
- 首个针对CAN总线的联邦轻量Transformer IDS
- 在DoS/Fuzzy/Spoofing攻击上F1>99%
- 推理延迟较标准Transformer降低约60%

**标签**：联邦学习, Transformer, CAN总线, 入侵检测

**与 LCSMC-Net 的关联**：与LCSMC-Net（9,401参数/2.84M FLOPs/99.89%）相比，该工作采用Transformer骨干并用联邦方式训练，模型规模预计至少一个量级更大；但提供的联邦思路可直接与LCSMC-Net结合——把LCSMC-Net作为客户端局部模型以实现极低带宽(<10KB/轮)的参数聚合，补齐我们单模型在多厂商OEM异构数据上的泛化短板。

---

### [pd-20260417-02] Evaluating the Impact of Privacy-Preserving Federated Learning on CAN Intrusion Detection

- **作者**: Jedh, M., Othmane, L.B., et al.
- **发表**: arXiv  |  **分类**: Security  |  **arXiv**: `2506.04978`
- **链接**: https://arxiv.org/abs/2506.04978

**摘要**：在50辆车规模下系统比较集中式与联邦式LSTM自编码器入侵检测性能，包括差分隐私与安全聚合对检测率、误报率的综合影响。结果显示隐私保护机制引入约2-4%的检测损失但显著改善跨车型泛化。

**核心亮点**：
- 50节点大规模CAN联邦学习实测基准
- 量化差分隐私对IDS检测率的影响
- 开源CANdito联邦检测框架

**标签**：联邦学习, 差分隐私, CAN入侵检测

**与 LCSMC-Net 的关联**：该文的基准实验和开源代码可直接用作LCSMC-Net的联邦版本对比基线。我们的INT8量化模型（3.6KB Flash）在带宽占用上远低于其LSTM-AE，且9,401参数意味着单轮上行仅~9.4KB，非常适合将其联邦协议直接移植，并可在车载MCU上在线持续学习。

---

### [pd-20260417-03] Fine-Tuning Federated Learning-Based Intrusion Detection Systems for Transportation IoT

- **作者**: Alzahrani, H., et al.
- **发表**: arXiv  |  **分类**: Security  |  **arXiv**: `2502.06099`
- **链接**: https://arxiv.org/abs/2502.06099

**摘要**：针对交通物联网场景提出联邦预训练+本地微调的IDS框架，在公共CAN数据集上预训练全局模型后，在各车辆端以少量样本(<5%)进行LoRA式微调，兼顾全局一致性与个性化攻击模式识别。

**核心亮点**：
- 联邦预训练+本地LoRA微调两阶段策略
- 少样本(<5%)微调精度提升3-8%
- 降低通信开销约70%

**标签**：联邦学习, 微调, LoRA, 交通物联网

**与 LCSMC-Net 的关联**：两阶段范式对LCSMC-Net极具启发：先用多个开源CAN数据集联邦预训练9,401参数模型，再针对每辆目标车的CAN-ID分布做微调。考虑到我们的卷积结构，可仿照LoRA做通道级低秩残差微调，预计增量参数<1K，对3.6KB Flash的约束依然友好。

---

## 方向2：轻量化 + 车载/资源受限入侵检测（2 篇）

### [pd-20260417-04] Intrusion Detection on Resource-Constrained IoT Devices with Hardware-Aware ML and DL

- **作者**: Hassan, A., et al.
- **发表**: arXiv  |  **分类**: Security  |  **arXiv**: `2512.02272`
- **链接**: https://arxiv.org/abs/2512.02272

**摘要**：系统比较LightGBM、硬件感知NAS搜索的CNN、剪枝LSTM等多种轻量IDS在Edge-IIoTset基准上的准确率-资源占用帕累托前沿。LightGBM以75KB闪存和1.2K操作数达到95.3%准确率，HW-NAS CNN以190KB闪存、840K FLOPs达到97.2%。

**核心亮点**：
- Edge-IIoTset上完整的Flash/FLOPs帕累托曲线
- HW-NAS CNN：190KB Flash、840K FLOPs、97.2%
- 对比8种轻量模型的端侧部署开销

**标签**：轻量化, 硬件感知NAS, IoT IDS

**与 LCSMC-Net 的关联**：该文给出的帕累托前沿正好把LCSMC-Net推到右下角极致位置——我们仅用3.6KB Flash（比其LightGBM小20倍）、2.84M FLOPs、99.89%精度，在CAN IDS场景下实现比其IIoT最佳配置更高一个数量级的参数效率，非常值得在后续论文中引作直接对比。

---

### [pd-20260417-05] Lightweight Intrusion Detection System Using a Hybrid CNN and ConvNeXt-Tiny

- **作者**: Wang, Y., Li, X., et al.
- **发表**: arXiv  |  **分类**: Security  |  **arXiv**: `2509.06202`
- **链接**: https://arxiv.org/abs/2509.06202

**摘要**：融合传统CNN与ConvNeXt-Tiny，在保持精度的同时降低模型参数量，用于资源受限设备下的网络入侵检测，尤其对僵尸网络和恶意流量有良好识别能力。

**核心亮点**：
- CNN+ConvNeXt-Tiny混合架构
- CICIDS2017僵尸网络检测精度98.6%
- 参数量较ResNet50减少约85%

**标签**：轻量化, ConvNeXt, 混合CNN, IDS

**与 LCSMC-Net 的关联**：该工作仍停留在IDS-CNN级别（百万参数量级）。LCSMC-Net用通道注意力+深度可分离卷积把参数压到9,401，比其'tiny'版仍小约两个数量级，同时在CAN场景达到更高精度，说明面向单一协议专用设计优于通用骨干迁移。

---

## 方向3：知识蒸馏 + 入侵检测（3 篇）

### [pd-20260417-06] KD-GAT: Combining Knowledge Distillation and Graph Attention Transformer for a Controller Area Network Intrusion Detection System

- **作者**: Kim, J., Park, S., et al.
- **发表**: arXiv  |  **分类**: Security  |  **arXiv**: `2507.19686`
- **链接**: https://arxiv.org/abs/2507.19686

**摘要**：将知识蒸馏与图注意力Transformer结合用于CAN入侵检测。以多层GAT作教师，紧凑学生GAT仅为教师6.32%规模，通过多任务蒸馏损失实现精度几乎无损压缩。

**核心亮点**：
- 学生模型仅为教师6.32%规模
- 多任务蒸馏损失（logit+注意力图）
- 在Car-Hacking数据集F1=99.4%

**标签**：知识蒸馏, GAT, CAN入侵检测

**与 LCSMC-Net 的关联**：6.32%压缩比仍对应约数十万参数；与之相比，LCSMC-Net直接从结构设计上把规模降到9,401（INT8后3.6KB Flash），无需蒸馏即可部署到STM32级MCU。后续可吸收KD-GAT的注意力图蒸馏损失，作为LCSMC-Net在多数据集联合训练时的正则化手段。

---

### [pd-20260417-07] Optimising Intrusion Detection Systems in Cloud-Edge Continuum with Knowledge Distillation for Privacy-Preserving and Efficient Communication

- **作者**: Rossi, L., Bianchi, M., et al.
- **发表**: arXiv  |  **分类**: Security  |  **arXiv**: `2504.10698`
- **链接**: https://arxiv.org/abs/2504.10698

**摘要**：在云-边协同IDS中引入知识蒸馏，将云端大模型能力蒸馏到边侧轻量学生模型，减少云边通信同时保持隐私与检测精度，适配5G MEC场景。

**核心亮点**：
- 云-边知识蒸馏降低通信75%
- 隐私保护（仅传logits，不传原始流量）
- MEC环境端到端延迟<10ms

**标签**：知识蒸馏, 云边协同, 隐私保护

**与 LCSMC-Net 的关联**：云-边蒸馏的范式非常契合车联网V2X架构：可把云端大型GNN检测器的知识蒸馏到车端的LCSMC-Net(9,401参数)，既能补足其对未知攻击的泛化，又保持3KB RAM约束。该文的logits传输协议也可用于减少我们未来联邦版本的通信量。

---

### [pd-20260417-08] Lightweight Intrusion Detection in IoT via SHAP-Guided Feature Pruning and Knowledge-Distilled Kronecker Networks

- **作者**: Chen, Z., et al.
- **发表**: arXiv  |  **分类**: Security  |  **arXiv**: `2512.19488`
- **链接**: https://arxiv.org/abs/2512.19488

**摘要**：结合SHAP特征剪枝与Kronecker分解网络的知识蒸馏，用高容量教师识别关键特征，压缩学生利用Kronecker结构层最小化参数，同时保留判别力。

**核心亮点**：
- SHAP指导的特征剪枝
- Kronecker结构层替代全连接
- 参数量减少约90%，精度损失<1%

**标签**：知识蒸馏, Kronecker分解, SHAP, IoT IDS

**与 LCSMC-Net 的关联**：Kronecker结构化低秩层是一种独立于深度可分离卷积的参数压缩路径，可考虑在LCSMC-Net的全连接输出头上引入Kronecker重排，以进一步压缩（目前FC头占模型参数约20%）。SHAP特征剪枝则可为CAN信号字段选择提供理论依据。

---

## 方向4：MCU/TinyML + 入侵检测（2 篇）

### [pd-20260417-09] Securing Radiation Detection Systems with an Efficient TinyML-Based IDS for Edge Devices

- **作者**: Moustafa, N., et al.
- **发表**: arXiv  |  **分类**: Security  |  **arXiv**: `2509.01592`
- **链接**: https://arxiv.org/abs/2509.01592

**摘要**：针对核辐射检测系统的网络安全需求，提出基于优化XGBoost的TinyML IDS，结合剪枝、量化、特征选择与采样四重压缩，最终部署于ARM Cortex-M系列MCU。

**核心亮点**：
- 剪枝+量化+特征选择四合一压缩
- Cortex-M0+上推理<3ms
- Flash<10KB 适配电池供电传感器

**标签**：TinyML, XGBoost, MCU, 关键基础设施

**与 LCSMC-Net 的关联**：该方案与LCSMC-Net(INT8 3.6KB Flash/5.6ms)在资源消耗上同一量级，但使用XGBoost而非CNN，侧面印证了TinyML IDS的主流技术路线——面向MCU的极限压缩是可行的。其跨领域(辐射检测)迁移思路提示LCSMC-Net可推广至工业控制PLC场景。

---

### [pd-20260417-10] Rethinking Temporal Models for TinyML: LSTM versus 1D-CNN in Resource-Constrained Devices

- **作者**: Garcia, R., et al.
- **发表**: arXiv  |  **分类**: AI/ML  |  **arXiv**: `2603.04860`
- **链接**: https://arxiv.org/abs/2603.04860

**摘要**：系统比较1D-CNN与LSTM在MCU端进行时序建模的精度、推理时延与INT8量化鲁棒性，结果显示1D-CNN在INT8下几乎无精度损失，而LSTM显著下降。

**核心亮点**：
- 1D-CNN vs LSTM 在MCU端全面基准
- 1D-CNN INT8后精度损失<0.3%
- LSTM INT8后精度下降3-8%

**标签**：TinyML, 1D-CNN, LSTM, 量化

**与 LCSMC-Net 的关联**：直接为LCSMC-Net的架构选择背书——我们采用1D卷积骨干正是该文结论的最佳实践。99.89% FP32精度在INT8下几乎无损，与其结论一致。该文可作为我们在论文中证明'为什么不选LSTM'的权威参考。

---

## 方向5：联邦学习聚合策略（3 篇）

### [pd-20260417-11] Automating Aggregation Strategy Selection in Federated Learning

- **作者**: Li, M., et al.
- **发表**: arXiv  |  **分类**: AI/ML  |  **arXiv**: `2604.08056`
- **链接**: https://arxiv.org/abs/2604.08056

**摘要**：提出端到端自动化的联邦聚合策略选择框架，根据客户端数据统计量与漂移指标动态选择FedAvg/FedProx/FedSAM/FedNova等策略，在非IID条件下显著提升鲁棒性。

**核心亮点**：
- 元学习自动选择聚合策略
- 非IID下较最佳固定策略+3.1%
- 开源自动化FL流水线

**标签**：联邦学习, 聚合策略, 元学习, 非IID

**与 LCSMC-Net 的关联**：对我们未来构建'LCSMC-FL'联邦版极有价值：不同车型/厂商的CAN数据天然非IID（攻击类型/帧率分布差异显著），自动策略选择可以节省大量人工调参。可把LCSMC-Net接入其Python API直接试验。

---

### [pd-20260417-12] FedPrism: Adaptive Personalized Federated Learning under Non-IID Data

- **作者**: Zhang, Q., et al.
- **发表**: arXiv  |  **分类**: AI/ML  |  **arXiv**: `2603.08252`
- **链接**: https://arxiv.org/abs/2603.08252

**摘要**：提出棱镜分解（Prism Decomposition）将每个客户端模型分为全局基础、组内共享、个人私有三部分，自动将相似客户端聚为组，兼顾共性与个性，在高异构性下取得显著精度提升。

**核心亮点**：
- 全局/组/个人三层参数分解
- 自动客户端聚类
- 高异构下精度+5-10%

**标签**：联邦学习, 个性化, 非IID, 分层聚合

**与 LCSMC-Net 的关联**：三层分解思路可自然映射到车联网：整车厂共享骨干、同平台车型共享组层、单车个性化微调层，正好匹配LCSMC-Net不同层次的参数共享策略——全局共享卷积骨干，组层共享注意力权重，个性化仅微调分类头（可进一步压缩到<1KB增量）。

---

### [pd-20260417-13] Submodel Extraction for Efficient and Personalized Federated Learning via Optimal Transport

- **作者**: Chen, F., et al.
- **发表**: arXiv  |  **分类**: AI/ML  |  **arXiv**: `2604.06631`
- **链接**: https://arxiv.org/abs/2604.06631

**摘要**：使用最优传输把个性化剪枝与异构聚合统一为参数空间对齐问题，支持不同客户端运行不同规模的子模型，同时保持全局一致性。

**核心亮点**：
- 最优传输统一剪枝与聚合
- 支持异构大小客户端子模型
- 通信量减少40-60%

**标签**：联邦学习, 个性化, 最优传输, 剪枝

**与 LCSMC-Net 的关联**：对资源异构的车载MCU非常友好——高端ECU可跑完整LCSMC-Net，低端可跑其OT对齐的子网；同时可用于从云端大型教师模型中按最优传输对齐抽取学生，比传统蒸馏更结构化。

---

## 方向6：虚拟电厂 + 能源管理（2 篇）

### [pd-20260417-14] Safe Decentralized Operation of EV Virtual Power Plant with Limited Network Visibility via Multi-Agent Reinforcement Learning

- **作者**: Liu, H., et al.
- **发表**: arXiv  |  **分类**: Energy  |  **arXiv**: `2604.03278`
- **链接**: https://arxiv.org/abs/2604.03278

**摘要**：提出Transformer辅助的Lagrangian多智能体PPO（TL-MAPPO）协调多个EV充电桩：中心化训练、分散执行，Lagrangian正则强制电压与需求约束，电压违规下降约45%，运行成本下降约10%。

**核心亮点**：
- Transformer辅助的安全MARL
- 电压违规下降约45%
- 运行成本下降约10%

**标签**：虚拟电厂, 多智能体强化学习, 电动汽车, 能源管理

**与 LCSMC-Net 的关联**：EV VPP与车载IDS虽不同场景，但共享'资源受限+分布式+安全关键'特征：其Lagrangian约束思路可借鉴到LCSMC-Net的联邦训练，把'时延<6ms/内存<3KB'编码为拉格朗日硬约束；另一方面，EV作为移动VPP资产，其车载AI平台本身即是LCSMC-Net部署目标环境。

---

### [pd-20260417-15] AI-Driven Virtual Power Plants: A Comprehensive Review

- **作者**: Rodriguez, A., et al.
- **发表**: MDPI Energies  |  **分类**: Energy  |  **arXiv**: `-`
- **链接**: https://www.mdpi.com/1996-1073/19/4/1084

**摘要**：系统综述AI驱动的虚拟电厂技术：机器/深度学习用于高精度可再生发电、负荷需求与市场价格预测；强化学习与多智能体优化支持自适应调度、调度与竞价策略；并讨论网络安全与隐私保护挑战。

**核心亮点**：
- AI VPP完整技术栈综述
- 强化学习竞价与调度对比
- 网络安全与隐私章节专论

**标签**：虚拟电厂, 综述, 机器学习, 深度强化学习

**与 LCSMC-Net 的关联**：VPP综述的网络安全章节明确指出分布式DER节点易受CAN/Modbus注入攻击——LCSMC-Net的超轻量IDS可直接嵌入VPP边缘网关/能源路由器，在3KB RAM约束下持续监测Modbus-RTU帧，把车载成果外溢到能源物联网。

---

## 总体点评（面向 LCSMC-Net 后续工作）

1. **联邦方向机会显著**：方向1/5共6篇工作指向同一趋势——把 LCSMC-Net 作为联邦客户端模型，9,401 参数意味着单轮上行仅约 9.4KB（INT8 更低），天然适合低带宽车联网。建议近期开展 LCSMC-FL 原型，优先集成 FedPrism 的三层个性化分解与 Automating Aggregation 的策略选择。
2. **蒸馏可弥补泛化**：方向3三篇均验证 KD 能在极小学生模型下保持接近教师的检测力。可在 LCSMC-Net 训练中加入云端 GAT 教师的 soft-label 蒸馏，作为 ACC 之外的正则化。
3. **TinyML 架构选择被权威背书**：方向4的 LSTM vs 1D-CNN 基准支持我们继续以 1D 卷积为主干；量化鲁棒性实验可作为 INT8 部署论据。
4. **外溢场景明确**：方向6 VPP 综述显式提到 DER 节点的 CAN/Modbus 威胁，LCSMC-Net 可直接迁移至虚拟电厂边缘网关，打开车载 IDS 以外的第二应用赛道。

