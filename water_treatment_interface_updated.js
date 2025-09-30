// Water Treatment Data Entry System JavaScript

class DataEntryApp {
    constructor() {
        this.rowCounter = 3; // Starting after initial rows
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.calculateAllTotals();
        this.updateSummary();
        this.setCurrentDate();
    }

    setupEventListeners() {
        // Add row button
        document.getElementById('addRowBtn').addEventListener('click', () => {
            this.addNewRow();
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToExcel();
        });

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAllData();
        });

        // Listen for input changes to calculate totals
        document.getElementById('tableBody').addEventListener('input', (e) => {
            if (e.target.classList.contains('value-input')) {
                this.calculateRowTotal(e.target.closest('tr'));
                this.updateSummary();
            }
        });

        // Listen for remove row buttons
        document.getElementById('tableBody').addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-row')) {
                this.removeRow(e.target.closest('tr'));
            }
        });
    }

    setCurrentDate() {
        // Set current date for all date inputs that are empty
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = document.querySelectorAll('.date-input');
        dateInputs.forEach(input => {
            if (!input.value) {
                input.value = today;
            }
        });
    }

    addNewRow() {
        this.rowCounter++;
        const tableBody = document.getElementById('tableBody');
        const newRow = document.createElement('tr');
        newRow.setAttribute('data-row-id', this.rowCounter);
        
        const today = new Date().toISOString().split('T')[0];
        
        newRow.innerHTML = `
            <td><input type="text" placeholder="Enter category" class="category-input"></td>
            <td><input type="date" class="date-input" value="${today}"></td>
            <td><input type="number" step="0.01" class="value-input" data-col="a"></td>
            <td><input type="number" step="0.01" class="value-input" data-col="b"></td>
            <td><input type="number" step="0.01" class="value-input" data-col="c"></td>
            <td><input type="number" step="0.01" class="value-input" data-col="d"></td>
            <td><input type="number" step="0.01" class="value-input" data-col="e"></td>
            <td class="total-cell">0.00</td>
            <td><input type="text" placeholder="Unit" class="unit-input"></td>
            <td><button class="btn btn-danger btn-sm remove-row">Remove</button></td>
        `;
        
        tableBody.appendChild(newRow);
        this.updateSummary();
        
        // Focus on the first input of the new row
        newRow.querySelector('.category-input').focus();
    }

    removeRow(row) {
        if (document.querySelectorAll('#tableBody tr').length > 1) {
            row.remove();
            this.updateSummary();
        } else {
            alert('Cannot remove the last row!');
        }
    }

    calculateRowTotal(row) {
        const valueInputs = row.querySelectorAll('.value-input');
        const totalCell = row.querySelector('.total-cell');
        
        let total = 0;
        valueInputs.forEach(input => {
            const value = parseFloat(input.value) || 0;
            total += value;
        });
        
        totalCell.textContent = total.toFixed(2);
        return total;
    }

    calculateAllTotals() {
        const rows = document.querySelectorAll('#tableBody tr');
        rows.forEach(row => {
            this.calculateRowTotal(row);
        });
    }

    updateSummary() {
        const rows = document.querySelectorAll('#tableBody tr');
        const totalRowsElement = document.getElementById('totalRows');
        const grandTotalElement = document.getElementById('grandTotal');
        
        // Update total rows count
        totalRowsElement.textContent = rows.length;
        
        // Calculate grand total
        let grandTotal = 0;
        rows.forEach(row => {
            const totalCell = row.querySelector('.total-cell');
            const rowTotal = parseFloat(totalCell.textContent) || 0;
            grandTotal += rowTotal;
        });
        
        grandTotalElement.textContent = grandTotal.toFixed(2);
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            const inputs = document.querySelectorAll('#tableBody input');
            inputs.forEach(input => {
                if (input.type === 'date') {
                    input.value = new Date().toISOString().split('T')[0];
                } else {
                    input.value = '';
                }
            });
            this.calculateAllTotals();
            this.updateSummary();
        }
    }

    exportToExcel() {
        try {
            const table = document.getElementById('dataTable');
            const rows = table.querySelectorAll('tr');
            const csvData = [];
            
            // Process each row
            rows.forEach((row, rowIndex) => {
                const rowData = [];
                const cells = row.querySelectorAll('th, td');
                
                cells.forEach((cell, cellIndex) => {
                    // Skip the Actions column (last column)
                    if (cellIndex === cells.length - 1 && rowIndex > 0) {
                        return;
                    }
                    
                    // Get cell content
                    let cellContent = '';
                    const input = cell.querySelector('input');
                    
                    if (input) {
                        cellContent = input.value || '';
                    } else {
                        cellContent = cell.textContent.trim();
                    }
                    
                    // Handle special characters and quotes in CSV
                    if (cellContent.includes(',') || cellContent.includes('"') || cellContent.includes('\n')) {
                        cellContent = '"' + cellContent.replace(/"/g, '""') + '"';
                    }
                    
                    rowData.push(cellContent);
                });
                
                // Remove last element (Actions column) for data rows
                if (rowIndex > 0) {
                    rowData.pop();
                }
                
                csvData.push(rowData.join(','));
            });
            
            // Remove Actions column from header
            const headerRow = csvData[0].split(',');
            headerRow.pop();
            csvData[0] = headerRow.join(',');
            
            // Create CSV content
            const csvContent = csvData.join('\n');
            
            // Create and trigger download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `water_treatment_data_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Show success message
                this.showMessage('Data exported successfully!', 'success');
            } else {
                throw new Error('Your browser does not support file downloads');
            }
            
        } catch (error) {
            console.error('Export error:', error);
            this.showMessage('Export failed: ' + error.message, 'error');
        }
    }

    showMessage(text, type = 'info') {
        // Create and show a temporary message
        const message = document.createElement('div');
        message.className = `message message-${type}`;
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            transition: opacity 0.3s;
        `;
        
        if (type === 'success') {
            message.style.backgroundColor = '#28a745';
        } else if (type === 'error') {
            message.style.backgroundColor = '#dc3545';
        } else {
            message.style.backgroundColor = '#17a2b8';
        }
        
        document.body.appendChild(message);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new DataEntryApp();
});