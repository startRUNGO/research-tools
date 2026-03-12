// ==================== Neural Network Models ====================

function downloadModelSvg(button) {
    const modelCard = button.parentElement;
    const svg = modelCard.querySelector('.model-diagram');
    const modelName = modelCard.querySelector('h3').textContent;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = modelName.replace(/\s+/g, '_') + '.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const originalText = button.textContent;
    button.textContent = t('alert.downloadSuccess');
    button.style.background = '#27ae60';
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '';
    }, 2000);
}
