let chart;
const ctx = document.getElementById('myChart').getContext('2d');

// Generate colors for datasets
const colors = [
  '#3498db', '#e74c3c', '#2ecc71', '#9b59b6',
  '#f1c40f', '#1abc9c', '#34495e', '#d35400'
];

function getChartData() {
  const headerRow = document.getElementById('headerRow');
  const bodyRows = document.querySelectorAll('#dataBody tr');

  const labels = [];
  const datasets = [];
  const datasetCount = headerRow.children.length - 1;

  for (let i = 0; i < datasetCount; i++) {
    datasets.push({
      label: headerRow.children[i + 1].querySelector('input').value || `Dataset ${i + 1}`,
      data: [],
      backgroundColor: colors[i % colors.length],
      borderWidth: 2
    });
  }

  bodyRows.forEach(row => {
    const cells = row.querySelectorAll('td');
    labels.push(cells[0].querySelector('input').value);
    for (let i = 1; i < cells.length; i++) {
      const val = parseFloat(cells[i].querySelector('input').value);
      datasets[i - 1].data.push(isNaN(val) ? 0 : val);
    }
  });

  return { labels, datasets };
}

function renderChart() {
  const chartType = document.getElementById("chartType").value;
  const { labels, datasets } = getChartData();

  if (chart) chart.destroy();

  const isDark = document.body.classList.contains('dark-mode');

  chart = new Chart(ctx, {
    type: chartType,
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: chartType !== 'pie' && chartType !== 'doughnut',
          labels: {
            color: isDark ? '#fff' : '#000'
          }
        }
      },
      scales: chartType === 'bar' || chartType === 'line' ? {
        x: {
          ticks: { color: isDark ? '#eee' : '#000' },
          grid: { color: isDark ? '#555' : '#ccc' }
        },
        y: {
          ticks: { color: isDark ? '#eee' : '#000' },
          grid: { color: isDark ? '#555' : '#ccc' }
        }
      } : {}
    }
  });
}

function addRow() {
  const row = document.createElement('tr');
  const datasetCount = document.getElementById('headerRow').children.length - 1;
  row.innerHTML = `<td><input type="text" placeholder="Label"></td>` +
    Array(datasetCount).fill('<td><input type="number" value="0"></td>').join('');
  document.getElementById('dataBody').appendChild(row);
  renderChart();
}

function removeRow() {
  const tableBody = document.getElementById('dataBody');
  if (tableBody.rows.length > 1) tableBody.deleteRow(-1);
  renderChart();
}

function addDataset() {
  const headerRow = document.getElementById('headerRow');
  const newHeader = document.createElement('th');
  const datasetCount = headerRow.children.length;
  newHeader.innerHTML = `<input type="text" class="dataset-label" value="Dataset ${datasetCount}">`;
  headerRow.appendChild(newHeader);

  const bodyRows = document.querySelectorAll('#dataBody tr');
  bodyRows.forEach(row => {
    const newCell = document.createElement('td');
    newCell.innerHTML = `<input type="number" value="0">`;
    row.appendChild(newCell);
  });

  renderChart();
}

function removeDataset() {
  const headerRow = document.getElementById('headerRow');
  const colCount = headerRow.children.length;
  if (colCount <= 2) return;

  headerRow.removeChild(headerRow.lastElementChild);
  const bodyRows = document.querySelectorAll('#dataBody tr');
  bodyRows.forEach(row => row.removeChild(row.lastElementChild));

  renderChart();
}

// CSV Import
document.getElementById('csvFile').addEventListener('change', function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const csv = event.target.result;
    loadCSVData(csv);
  };
  reader.readAsText(file);
});

function loadCSVData(csv) {
  const lines = csv.trim().split('\n');
  const rows = lines.map(line => line.split(','));

  const headerRow = rows[0];
  const bodyRows = rows.slice(1);

  const headerEl = document.getElementById('headerRow');
  const bodyEl = document.getElementById('dataBody');
  headerEl.innerHTML = '';
  bodyEl.innerHTML = '';

  headerEl.innerHTML = `<th>Label</th>` + headerRow.slice(1).map(label =>
    `<th><input type="text" class="dataset-label" value="${label}"></th>`).join('');

  bodyRows.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input type="text" value="${row[0]}"></td>` +
      row.slice(1).map(value => `<td><input type="number" value="${value}"></td>`).join('');
    bodyEl.appendChild(tr);
  });

  renderChart();
}

// CSV Export
function exportToCSV() {
  const headerRow = document.getElementById('headerRow');
  const bodyRows = document.querySelectorAll('#dataBody tr');

  let csv = [];

  let headers = ['Label'];
  for (let i = 1; i < headerRow.children.length; i++) {
    const input = headerRow.children[i].querySelector('input');
    headers.push(input ? input.value : `Dataset ${i}`);
  }
  csv.push(headers.join(','));

  bodyRows.forEach(row => {
    const cells = row.querySelectorAll('td');
    const values = [];
    cells.forEach(cell => {
      const input = cell.querySelector('input');
      values.push(input ? input.value : '');
    });
    csv.push(values.join(','));
  });

  const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'chart_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Dark Mode Toggle
const darkToggle = document.getElementById('darkModeToggle');

if (localStorage.getItem('darkMode') === 'true') {
  document.body.classList.add('dark-mode');
  darkToggle.checked = true;
}

darkToggle.addEventListener('change', () => {
  const isDark = darkToggle.checked;
  document.body.classList.toggle('dark-mode', isDark);
  localStorage.setItem('darkMode', isDark);
  renderChart();
});

// Save Chart as Image
function saveAsImage() {
  const link = document.createElement('a');
  link.download = 'chart.png';
  link.href = chart.toBase64Image();
  link.click();
}

// Save Chart as PDF
async function saveAsPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  const imageData = chart.toBase64Image();
  const imgProps = pdf.getImageProperties(imageData);

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imageData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight);
  pdf.save('chart.pdf');
}

// Event bindings
document.getElementById('dataTable').addEventListener('input', renderChart);
document.getElementById('chartType').addEventListener('change', renderChart);

// Initial render
renderChart();
