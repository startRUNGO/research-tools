// ==================== Data Visualization ====================

let vizChart = null;

function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return null;
    const headers = lines[0].split(/[,\t;]/).map(h => h.trim().replace(/^["']|["']$/g, ''));
    const data = lines.slice(1).map(line => {
        return line.split(/[,\t;]/).map(cell => cell.trim().replace(/^["']|["']$/g, ''));
    }).filter(row => row.length === headers.length);
    return { headers, data };
}

function renderChart() {
    const input = document.getElementById('csvInput');
    const chartType = document.getElementById('chartType').value;
    const canvas = document.getElementById('vizCanvas');
    if (!input || !canvas) return;

    const text = input.value.trim();
    if (!text) { showToast(t('alert.noContent'), 'warning'); return; }

    const parsed = parseCSV(text);
    if (!parsed || parsed.data.length === 0) {
        showToast(t('viz.parseError'), 'error'); return;
    }

    // Determine which columns are numeric
    const numericCols = [];
    parsed.headers.forEach((h, i) => {
        if (i === 0) return;
        const isNumeric = parsed.data.every(row => !isNaN(parseFloat(row[i])));
        if (isNumeric) numericCols.push(i);
    });

    if (numericCols.length === 0) {
        showToast(t('viz.noNumeric'), 'warning'); return;
    }

    const labels = parsed.data.map(row => row[0]);
    const colors = ['#667eea', '#e74c3c', '#27ae60', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#3498db'];

    const datasets = numericCols.map((colIdx, i) => ({
        label: parsed.headers[colIdx],
        data: parsed.data.map(row => parseFloat(row[colIdx])),
        backgroundColor: chartType === 'line' || chartType === 'radar'
            ? colors[i % colors.length] + '33'
            : colors.map((c, j) => numericCols.length === 1 ? colors[j % colors.length] + 'cc' : colors[i % colors.length] + 'cc'),
        borderColor: colors[i % colors.length],
        borderWidth: 2,
        tension: 0.3,
        fill: chartType === 'radar'
    }));

    if (vizChart) vizChart.destroy();

    const ctx = canvas.getContext('2d');
    vizChart = new Chart(ctx, {
        type: chartType,
        data: { labels, datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: numericCols.length > 1 },
                title: { display: false }
            },
            scales: chartType !== 'pie' && chartType !== 'doughnut' && chartType !== 'radar' && chartType !== 'polarArea' ? {
                y: { beginAtZero: true }
            } : undefined
        }
    });

    document.getElementById('vizCanvasContainer').style.display = 'block';
}

function downloadChart() {
    const canvas = document.getElementById('vizCanvas');
    if (!canvas || !vizChart) { showToast(t('alert.noContent'), 'warning'); return; }
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png', 1.0);
    a.download = 'chart.png';
    a.click();
    showToast(t('alert.downloadSuccess'));
}

function loadSampleData() {
    const input = document.getElementById('csvInput');
    if (!input) return;
    input.value = 'Category,Value A,Value B\nQ1,120,85\nQ2,200,150\nQ3,150,120\nQ4,180,200\nQ5,220,175';
    renderChart();
}

function clearViz() {
    const input = document.getElementById('csvInput');
    if (input) input.value = '';
    if (vizChart) { vizChart.destroy(); vizChart = null; }
    const container = document.getElementById('vizCanvasContainer');
    if (container) container.style.display = 'none';
}
