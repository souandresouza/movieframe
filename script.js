document.addEventListener('DOMContentLoaded', function() {
    const videoInput = document.getElementById('videoInput');
    const videoElement = document.getElementById('videoElement');
    const canvas = document.getElementById('canvas');
    const framePreview = document.getElementById('framePreview');
    const preview = document.getElementById('preview');
    const downloadBtn = document.getElementById('downloadBtn');
    
    let fileName = '';
    
    // Evento para quando um arquivo é selecionado
    videoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove a extensão
        
        const videoURL = URL.createObjectURL(file);
        videoElement.src = videoURL;
        
        // Quando o vídeo estiver carregado, extrair o primeiro frame
        videoElement.onloadeddata = function() {
            extractFrame();
        };
    });
    
    // Função para extrair o frame do vídeo
    function extractFrame() {
        // Definir o tempo para 0 (primeiro frame)
        videoElement.currentTime = 0;
        
        // Quando o vídeo estiver no tempo correto, capturar o frame
        videoElement.onseeked = function() {
            // Configurar o canvas com as dimensões do vídeo
            canvas.width = videoElement.videoWidth;
            canvas.height = videoElement.videoHeight;
            
            // Desenhar o frame atual no canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
            
            // Converter o canvas para uma URL de dados PNG
            const dataURL = canvas.toDataURL('image/png');
            
            // Mostrar a prévia
            framePreview.src = dataURL;
            preview.classList.remove('hidden');
            
            // Revogar a URL do objeto para liberar memória
            URL.revokeObjectURL(videoElement.src);
        };
    }
    
    // Evento para baixar o frame
    downloadBtn.addEventListener('click', function() {
        const dataURL = framePreview.src;
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `${fileName}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    // Adicionar suporte para arrastar e soltar
    const uploadArea = document.querySelector('.upload-area');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        uploadArea.classList.add('highlight');
    }
    
    function unhighlight() {
        uploadArea.classList.remove('highlight');
    }
    
    uploadArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        
        if (file && file.type.startsWith('video/')) {
            videoInput.files = dt.files;
            const event = new Event('change');
            videoInput.dispatchEvent(event);
        }
    }
});