// Dados do Show do Milhão. A primeira resposta é a certa; a ordem na tela é
// sorteada. Para mudar o jogo, basta editar as listas.
export const LADDER = [1_000, 2_000, 5_000, 10_000, 20_000, 50_000, 100_000, 200_000, 500_000, 1_000_000]

// Nível da escada (índice) → dificuldade.
export const tierFor = (level) => (level < 3 ? 'easy' : level < 7 ? 'medium' : 'hard')

export const QUESTIONS = {
  easy: [
    ['Which planet is known as the Red Planet?', 'Mars', 'Venus', 'Jupiter', 'Saturn'],
    ['How many legs does a spider have?', 'Eight', 'Six', 'Ten', 'Twelve'],
    ['What is the largest ocean on Earth?', 'Pacific', 'Atlantic', 'Indian', 'Arctic'],
    ['What is the capital of Brazil?', 'Brasília', 'Rio de Janeiro', 'São Paulo', 'Salvador'],
    ['At what temperature does water freeze at sea level?', '0 °C', '10 °C', '−10 °C', '32 °C'],
    ['How many sides does a hexagon have?', 'Six', 'Five', 'Seven', 'Eight'],
    ['Which gas do plants take from the air for photosynthesis?', 'Carbon dioxide', 'Oxygen', 'Nitrogen', 'Helium'],
  ],
  medium: [
    ['Who painted the Mona Lisa?', 'Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Caravaggio'],
    ['What is the chemical symbol for gold?', 'Au', 'Ag', 'Gd', 'Go'],
    ['How many bits are in a byte?', 'Eight', 'Four', 'Sixteen', 'Thirty-two'],
    ['In what year did humans first land on the Moon?', '1969', '1965', '1972', '1959'],
    ['Which programming language runs natively in every web browser?', 'JavaScript', 'Python', 'Java', 'C#'],
    ['What is the largest planet in the Solar System?', 'Jupiter', 'Saturn', 'Neptune', 'Earth'],
    ['Which organ produces insulin?', 'Pancreas', 'Liver', 'Kidney', 'Spleen'],
    ['Which data structure works as “last in, first out”?', 'Stack', 'Queue', 'Heap', 'Linked list'],
    ['What is the smallest prime number?', '2', '1', '3', '0'],
  ],
  hard: [
    ['Who wrote the novel “Dom Casmurro”?', 'Machado de Assis', 'José de Alencar', 'Jorge Amado', 'Clarice Lispector'],
    ['Which shading language was designed for WebGPU?', 'WGSL', 'GLSL', 'HLSL', 'MSL'],
    ['In what year did the Berlin Wall fall?', '1989', '1987', '1991', '1985'],
    ['In which country is the Atacama Desert?', 'Chile', 'Peru', 'Argentina', 'Bolivia'],
    ['What is the time complexity of binary search on a sorted array?', 'O(log n)', 'O(n)', 'O(n log n)', 'O(1)'],
    ['Who hosted the Brazilian game show “Show do Milhão”?', 'Silvio Santos', 'Fausto Silva', 'Gugu Liberato', 'Luciano Huck'],
    ['Roughly how fast does light travel in a vacuum?', '300,000 km/s', '30,000 km/s', '3,000,000 km/s', '150,000 km/s'],
    ['Which metal has the highest melting point?', 'Tungsten', 'Iron', 'Titanium', 'Platinum'],
  ],
}

export const money = (value) => `R$ ${value.toLocaleString('en')}`
