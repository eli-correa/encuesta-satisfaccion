// Opcional para PWA: Registro del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js') // Asegúrate que la ruta sea correcta
      .then(registration => {
        console.log('Service Worker registrado con éxito:', registration);
      })
      .catch(registrationError => {
        console.log('Fallo el registro del Service Worker:', registrationError);
      });
  });
}
document.addEventListener('DOMContentLoaded', () => {
    const surveyContainer = document.getElementById('surveyContainer');
    const statsContainer = document.getElementById('statsContainer');
    const emojis = document.querySelectorAll('.emoji');
    const happyCountSpan = document.getElementById('happyCount');
    const neutralCountSpan = document.getElementById('neutralCount');
    const angryCountSpan = document.getElementById('angryCount');
    const happyPercentageSpan = document.getElementById('happyPercentage');
    const neutralPercentageSpan = document.getElementById('neutralPercentage');
    const angryPercentageSpan = document.getElementById('angryPercentage');
    const totalVotesSpan = document.getElementById('totalVotes');
    const resetButton = document.getElementById('resetButton');
    const fullscreenButton = document.getElementById('fullscreenButton'); // Referencia al nuevo botón de pantalla completa

    // Creación dinámica del elemento para el mensaje de agradecimiento
    const thankYouMessage = document.createElement('p');
    thankYouMessage.textContent = '¡Gracias por tu calificación!';
    thankYouMessage.style.fontSize = '1.8em';
    thankYouMessage.style.fontWeight = 'bold';
    thankYouMessage.style.marginTop = '30px';
    thankYouMessage.style.color = '#007bff';
    thankYouMessage.classList.add('hidden'); // Oculto inicialmente
    surveyContainer.appendChild(thankYouMessage); // Añadirlo al contenedor de la encuesta

    let satisfactionCounts = {
        happy: 0,
        neutral: 0,
        angry: 0
    };

    // Función para cargar los datos de satisfacción desde localStorage
    function loadSatisfactionData() {
        const storedData = localStorage.getItem('satisfactionData');
        if (storedData) {
            satisfactionCounts = JSON.parse(storedData);
        }
    }

    // Función para guardar los datos de satisfacción en localStorage
    function saveSatisfactionData() {
        localStorage.setItem('satisfactionData', JSON.stringify(satisfactionCounts));
    }

    // Función para actualizar la visualización de las estadísticas
    function updateStatsDisplay() {
        const total = satisfactionCounts.happy + satisfactionCounts.neutral + satisfactionCounts.angry;
        
        happyCountSpan.textContent = satisfactionCounts.happy;
        neutralCountSpan.textContent = satisfactionCounts.neutral;
        angryCountSpan.textContent = satisfactionCounts.angry;
        totalVotesSpan.textContent = total;

        happyPercentageSpan.textContent = total === 0 ? '0%' : ((satisfactionCounts.happy / total) * 100).toFixed(1) + '%';
        neutralPercentageSpan.textContent = total === 0 ? '0%' : ((satisfactionCounts.neutral / total) * 100).toFixed(1) + '%';
        angryPercentageSpan.textContent = total === 0 ? '0%' : ((satisfactionCounts.angry / total) * 100).toFixed(1) + '%';
    }

    // Manejador de eventos para cuando se hace clic en un emoji
    emojis.forEach(emoji => {
        emoji.addEventListener('click', (event) => {
            const satisfactionLevel = event.currentTarget.dataset.satisfaction;
            satisfactionCounts[satisfactionLevel]++;
            saveSatisfactionData();
            
            // Ocultar la pregunta y los emojis y mostrar el mensaje de agradecimiento
            document.querySelector('.container h1').classList.add('hidden');
            document.querySelector('.emojis').classList.add('hidden');
            thankYouMessage.classList.remove('hidden'); 

            // Después de 2.5 segundos, ocultar el mensaje y mostrar de nuevo la encuesta
            setTimeout(() => {
                thankYouMessage.classList.add('hidden');
                document.querySelector('.container h1').classList.remove('hidden');
                document.querySelector('.emojis').classList.remove('hidden');
            }, 2500); // 2.5 segundos
        });
    });

    // Manejador de eventos para detectar cambios en el modo de pantalla completa
    function handleFullscreenChange() {
        if (document.fullscreenElement) {
            // Si se entró en pantalla completa: Muestra la encuesta, oculta las estadísticas
            surveyContainer.classList.remove('hidden');
            statsContainer.classList.add('hidden');
            // Asegurarse de que el mensaje de gracias esté oculto y la encuesta visible al entrar en fullscreen
            thankYouMessage.classList.add('hidden');
            document.querySelector('.container h1').classList.remove('hidden');
            document.querySelector('.emojis').classList.remove('hidden');
        } else {
            // Si se salió de pantalla completa: Muestra las estadísticas, oculta la encuesta
            loadSatisfactionData(); // Carga los datos más recientes antes de mostrarlos
            updateStatsDisplay();
            surveyContainer.classList.add('hidden');
            statsContainer.classList.remove('hidden');
        }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange); // Para navegadores basados en WebKit
    document.addEventListener('mozfullscreenchange', handleFullscreenChange); // Para Firefox
    document.addEventListener('MSFullscreenChange', handleFullscreenChange); // Para IE/Edge

    // Manejador de eventos para el botón de Reiniciar Encuesta
    resetButton.addEventListener('click', () => {
        satisfactionCounts = {
            happy: 0,
            neutral: 0,
            angry: 0
        };
        saveSatisfactionData(); // Guarda el estado reseteado
        updateStatsDisplay();   // Actualiza la visualización de estadísticas
        alert('Datos de la encuesta reiniciados.'); // Notificación al usuario
    });

    // Función para activar el modo de pantalla completa
    function enterFullscreen() {
        const element = document.documentElement; // Se refiere al elemento <html> completo
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { /* Firefox */
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { /* Chrome, Safari y Opera */
            element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { /* IE/Edge */
            element.msRequestFullscreen();
        }
    }

    // Event listener para el botón "Iniciar Encuesta (Pantalla Completa)"
    fullscreenButton.addEventListener('click', enterFullscreen);


    // Lógica de inicialización al cargar la página:
    // Muestra las estadísticas por defecto si no estamos en pantalla completa,
    // o la encuesta si ya estamos en pantalla completa (útil para kioscos que inician así).
    loadSatisfactionData(); // Carga los datos iniciales
    if (!document.fullscreenElement) { // Si no estamos en pantalla completa al cargar
        surveyContainer.classList.add('hidden');    // Oculta la interfaz de encuesta
        statsContainer.classList.remove('hidden'); // Muestra la interfaz de estadísticas
        updateStatsDisplay();                       // Asegura que las estadísticas estén actualizadas
    } else { // Si la página se carga ya en modo de pantalla completa (ej. en un entorno de kiosco)
        surveyContainer.classList.remove('hidden'); // Muestra la interfaz de encuesta
        statsContainer.classList.add('hidden');     // Oculta la interfaz de estadísticas
    }

    // Opcional para PWA: Registro del Service Worker
    /*
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
    */
});