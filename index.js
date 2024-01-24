var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
let inputImg = document.getElementById("input_img")
let imagesFile = []
inputImg.onchange = ()=>{
    imagesFile = inputImg.files
    list_imgs()
}
const _cropedImages = []
function list_imgs() {
    for (let index = 0; index < imagesFile.length; index++) {
        const file_bruto = imagesFile[index];
        const reader = new FileReader()
        reader.onload = function(event) {
            // Criar um elemento de imagem
            const file = event.target.result;
            crop(file)
        };
        reader.readAsDataURL(file_bruto);
    }
    
}


function crop(src){
    return new Promise((resolve) => {
    const img = new Image()
    img.onload = function() {

        // Criar um elemento de canvas
        // Definir o tamanho do canvas igual ao da imagem
        canvas.width = img.width;
        canvas.height = img.height;
      
        // Desenhar a imagem no canvas
        ctx.drawImage(img, 0, 0);
        document.getElementById("imgs")
        // Obter os dados da imagem
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var pixels = imageData.data;
      
        // Definir as coordenadas dos pixels mais próximos das bordas
        var left = canvas.width;
        var right = 0;
        var top = canvas.height;
        var bottom = 0;
      
        // Percorrer os pixels para encontrar os mais próximos das bordas
        for (var y = 0; y < canvas.height; y++) {
          for (var x = 0; x < canvas.width; x++) {
            var index = (y * canvas.width + x) * 4; // Índice do pixel RGBA
      
            // Verificar se o pixel não é transparente
            if (pixels[index + 3] !== 0) {
              // Verificar borda esquerda
              if (x < left) left = x;
      
              // Verificar borda direita
              if (x > right) right = x;
      
              // Verificar borda superior
              if (y < top) top = y;
      
              // Verificar borda inferior
              if (y > bottom) bottom = y;
            }
          }
        }
        var croppedCanvas = document.createElement('canvas');
        var croppedCtx = croppedCanvas.getContext('2d');

        // Definir as dimensões do novo canvas
        var newWidth = right - left + 1; // +1 para incluir o pixel da borda
        var newHeight = bottom - top + 1;

        croppedCanvas.width = newWidth;
        croppedCanvas.height = newHeight;

        // Desenhar a parte cortada da imagem no novo canvas
        croppedCtx.drawImage(
            img, // Imagem original
            left, // Coordenada x inicial para cortar
            top, // Coordenada y inicial para cortar
            newWidth, // Largura da área a ser cortada
            newHeight, // Altura da área a ser cortada
            0, // Coordenada x para desenhar no novo canvas
            0, // Coordenada y para desenhar no novo canvas
            newWidth, // Largura da imagem cortada no novo canvas
            newHeight // Altura da imagem cortada no novo canvas
        );

        // Criar uma nova imagem a partir do canvas cortado
        const croppedImage = new Image();
        croppedImage.src = croppedCanvas.toDataURL();
        _cropedImages.push(croppedImage.src)
        reload()
        // Adicionar a imagem cortada ao DOM ou fazer o que for necessário com ela
        document.getElementById("imgs").appendChild(croppedImage);
        resolve()
        // Exibir as coordenadas dos pixels mais próximos das bordas

      };
   
      // Definir a origem da imagem
      img.src = src
    })
}
const button_download = document.createElement("div")
button_download.className = "download"
button_download.textContent = "Download"
button_download.style.display = "none"
button_download.onclick = ()=>{
    var zip = new JSZip();
    function addImageToZip(url, filename) {
        return fetch(url)
          .then(response => response.blob())
          .then(blob => {
            zip.file(filename, blob);
          });
      }
    var promises = [];
    _cropedImages.forEach((url, index) => {
    promises.push(addImageToZip(url, 'imagem_' + index + '.png'));
    });
    Promise.all(promises).then(() => {
    zip.generateAsync({ type: 'blob' }).then(blob => {
        // Cria um link de download para o arquivo ZIP
        var downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = _cropedImages.length+'croped_imagens_on_crop_png.zip';
        // Simula um clique no link para iniciar o download do ZIP
        downloadLink.click();
    });
    });
}
document.body.appendChild(button_download)
function reload(){
    if(_cropedImages.length>0){
        button_download.style.display = "block"
    }
}