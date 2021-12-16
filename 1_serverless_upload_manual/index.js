const pacientes = [
  { id: 1, nome: "Maria", idade: 20 },
  { id: 2, nome: "Joao", idade: 30 },
  { id: 3, nome: "Jose", idade: 45 },
];

function buscarPaciente(campo, valor) {
  return pacientes.find((paciente) => paciente[campo] == valor);
}

exports.handler = async (event) => {
  console.log("Paciente informado: " + event.pacienteId);

  let pacienteEncontrado = pacientes;
  console.log("Deploy cli");
  if (event.filtros.pacienteId)
    pacienteEncontrado = buscarPaciente("id", event.filtros.pacienteId);
  else if (event.filtros.idade)
    pacienteEncontrado = buscarPaciente("idade", event.filtros.idade);

  const response = {
    statusCode: 200,
    body: JSON.stringify(pacienteEncontrado),
  };
  return response;
};
