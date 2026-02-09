const sendButton = document.getElementById("sendButton");
const statusText = document.getElementById("status");
const consoleOutput = document.getElementById("consoleOutput");

const apiUrl =
  "https://api.journeybuilder.numia.co/api/v1/run/41bdeb72-bed8-4eac-8104-9a66d6033265?stream=false";

const headers = {
  "Content-Type": "application/json",
  "x-api-key": "sk-HLG3rbzWT3umx7I1uXX16lq1szZVQjRpuSf79FhUsl8",
  Origin: "journeybuilder.numia.co",
};

const bodyPayload = {
  input_value: "Hola",
  input_type: "chat",
};

const appendToConsole = (message) => {
  const timestamp = new Date().toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  consoleOutput.textContent += `\n[${timestamp}] ${message}`;
  consoleOutput.scrollTop = consoleOutput.scrollHeight;
};

const setStatus = (message, isError = false) => {
  statusText.textContent = message;
  statusText.style.color = isError ? "#ff8b8b" : "rgba(231, 238, 252, 0.7)";
};

const sendRequest = async () => {
  sendButton.disabled = true;
  setStatus("Enviando solicitud...");
  appendToConsole(">> POST /run ...");

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(bodyPayload),
    });

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (error) {
      data = rawText;
    }

    appendToConsole(`<< Status ${response.status}`);
    appendToConsole("Respuesta:");
    appendToConsole(
      typeof data === "string" ? data : JSON.stringify(data, null, 2)
    );

    setStatus("Respuesta recibida.");
  } catch (error) {
    appendToConsole(`!! Error: ${error.message}`);
    setStatus("Error al llamar la API.", true);
  } finally {
    sendButton.disabled = false;
  }
};

sendButton.addEventListener("click", () => {
  consoleOutput.textContent = "Consola lista.";
  sendRequest();
});
