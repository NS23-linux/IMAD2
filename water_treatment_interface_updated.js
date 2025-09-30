// Simple export to Excel for table
document.getElementById('exportBtn').addEventListener('click', function () {
  let table = document.getElementById('noteTable');
  let rows = table.querySelectorAll('tr');
  let csv = [];
  for (let row of rows) {
    let cells = row.querySelectorAll('th, td');
    let rowData = Array.from(cells).map(cell => {
      let input = cell.querySelector('input');
      return input ? input.value : cell.textContent;
    });
    csv.push(rowData.join(','));
  }
  let csvContent = "data:text/csv;charset=utf-8," + csv.join("\n");
  let link = document.createElement("a");
  link.setAttribute("href", csvContent);
  link.setAttribute("download", "notes.csv");
  link.click();
});
