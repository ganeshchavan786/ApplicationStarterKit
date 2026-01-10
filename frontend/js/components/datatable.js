/**
 * DataTable Component - Application Starter Kit
 * Custom vanilla JS data table with pagination, search, sort
 * Version: 2.0
 */

class DataTable {
  constructor(selector, options = {}) {
    this.container = document.querySelector(selector);
    if (!this.container) {
      console.error(`DataTable: Container "${selector}" not found`);
      return;
    }
    
    this.data = options.data || [];
    this.columns = options.columns || [];
    this.perPage = options.perPage || 10;
    this.currentPage = 1;
    this.searchable = options.searchable !== false;
    this.sortable = options.sortable !== false;
    this.selectable = options.selectable || false;
    this.onRowClick = options.onRowClick || null;
    this.onSelectionChange = options.onSelectionChange || null;
    this.emptyMessage = options.emptyMessage || 'No data available';
    this.loadingMessage = options.loadingMessage || 'Loading...';
    
    this.searchTerm = '';
    this.sortColumn = null;
    this.sortDirection = 'asc';
    this.selectedRows = new Set();
    this.isLoading = false;
    
    this.init();
  }
  
  init() {
    this.render();
  }
  
  render() {
    const filteredData = this.getFilteredData();
    const sortedData = this.getSortedData(filteredData);
    const paginatedData = this.getPaginatedData(sortedData);
    const totalPages = Math.ceil(sortedData.length / this.perPage);
    
    let html = '';
    
    if (this.searchable) {
      html += `
        <div class="datatable-header">
          <div class="datatable-search">
            <input type="text" class="form-input" placeholder="Search..." 
                   value="${this.searchTerm}" data-action="search">
          </div>
          <div class="datatable-info">
            Showing ${paginatedData.length} of ${sortedData.length} entries
          </div>
        </div>
      `;
    }
    
    html += `<div class="table-container">`;
    
    if (this.isLoading) {
      html += `
        <div class="datatable-loading">
          <div class="spinner"></div>
          <span>${this.loadingMessage}</span>
        </div>
      `;
    } else {
      html += `<table class="table ${this.sortable ? 'table-sortable' : ''}">`;
      
      html += '<thead><tr>';
      if (this.selectable) {
        html += `<th style="width: 40px;">
          <input type="checkbox" data-action="select-all" 
                 ${this.selectedRows.size === paginatedData.length && paginatedData.length > 0 ? 'checked' : ''}>
        </th>`;
      }
      this.columns.forEach(col => {
        const isSorted = this.sortColumn === col.key;
        const sortIcon = isSorted ? (this.sortDirection === 'asc' ? ' ↑' : ' ↓') : '';
        html += `<th data-sort="${col.key}" ${col.width ? `style="width: ${col.width}"` : ''}>
          ${col.label}${sortIcon}
        </th>`;
      });
      html += '</tr></thead>';
      
      html += '<tbody>';
      if (paginatedData.length === 0) {
        html += `<tr><td colspan="${this.columns.length + (this.selectable ? 1 : 0)}" 
                     style="text-align: center; padding: 40px; color: var(--text-muted);">
          ${this.emptyMessage}
        </td></tr>`;
      } else {
        paginatedData.forEach((row, index) => {
          const rowId = row.id || index;
          const isSelected = this.selectedRows.has(rowId);
          html += `<tr data-id="${rowId}" class="${isSelected ? 'selected' : ''}">`;
          if (this.selectable) {
            html += `<td><input type="checkbox" data-action="select-row" data-id="${rowId}" 
                         ${isSelected ? 'checked' : ''}></td>`;
          }
          this.columns.forEach(col => {
            let value = row[col.key];
            if (col.render) {
              value = col.render(value, row);
            } else if (value === null || value === undefined) {
              value = '-';
            }
            html += `<td>${value}</td>`;
          });
          html += '</tr>';
        });
      }
      html += '</tbody></table>';
    }
    
    html += '</div>';
    
    if (totalPages > 1) {
      html += `
        <div class="pagination">
          <button class="btn btn-sm btn-secondary" data-action="prev" 
                  ${this.currentPage === 1 ? 'disabled' : ''}>Previous</button>
          <span class="pagination-info">Page ${this.currentPage} of ${totalPages}</span>
          <button class="btn btn-sm btn-secondary" data-action="next" 
                  ${this.currentPage === totalPages ? 'disabled' : ''}>Next</button>
        </div>
      `;
    }
    
    this.container.innerHTML = html;
    this.bindEvents();
  }
  
  bindEvents() {
    const searchInput = this.container.querySelector('[data-action="search"]');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        this.search(e.target.value);
      }, 300));
    }
    
    this.container.querySelectorAll('[data-sort]').forEach(th => {
      th.addEventListener('click', () => {
        this.sort(th.dataset.sort);
      });
    });
    
    this.container.querySelector('[data-action="prev"]')?.addEventListener('click', () => {
      this.prevPage();
    });
    
    this.container.querySelector('[data-action="next"]')?.addEventListener('click', () => {
      this.nextPage();
    });
    
    this.container.querySelector('[data-action="select-all"]')?.addEventListener('change', (e) => {
      this.selectAll(e.target.checked);
    });
    
    this.container.querySelectorAll('[data-action="select-row"]').forEach(cb => {
      cb.addEventListener('change', (e) => {
        this.selectRow(cb.dataset.id, e.target.checked);
      });
    });
    
    if (this.onRowClick) {
      this.container.querySelectorAll('tbody tr[data-id]').forEach(tr => {
        tr.style.cursor = 'pointer';
        tr.addEventListener('click', (e) => {
          if (e.target.type !== 'checkbox') {
            const row = this.data.find(r => String(r.id) === tr.dataset.id);
            if (row) this.onRowClick(row);
          }
        });
      });
    }
  }
  
  getFilteredData() {
    if (!this.searchTerm) return this.data;
    const term = this.searchTerm.toLowerCase();
    return this.data.filter(row => 
      this.columns.some(col => {
        const value = row[col.key];
        return value && String(value).toLowerCase().includes(term);
      })
    );
  }
  
  getSortedData(data) {
    if (!this.sortColumn) return data;
    return [...data].sort((a, b) => {
      let aVal = a[this.sortColumn];
      let bVal = b[this.sortColumn];
      if (aVal === null || aVal === undefined) aVal = '';
      if (bVal === null || bVal === undefined) bVal = '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return this.sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }
  
  getPaginatedData(data) {
    const start = (this.currentPage - 1) * this.perPage;
    return data.slice(start, start + this.perPage);
  }
  
  setData(data) {
    this.data = data;
    this.currentPage = 1;
    this.selectedRows.clear();
    this.render();
  }
  
  search(term) {
    this.searchTerm = term;
    this.currentPage = 1;
    this.render();
  }
  
  sort(column) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.render();
  }
  
  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.render();
    }
  }
  
  nextPage() {
    const totalPages = Math.ceil(this.getFilteredData().length / this.perPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.render();
    }
  }
  
  goToPage(page) {
    const totalPages = Math.ceil(this.getFilteredData().length / this.perPage);
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.render();
    }
  }
  
  selectRow(id, selected) {
    if (selected) {
      this.selectedRows.add(id);
    } else {
      this.selectedRows.delete(id);
    }
    this.render();
    if (this.onSelectionChange) {
      this.onSelectionChange(Array.from(this.selectedRows));
    }
  }
  
  selectAll(selected) {
    const pageData = this.getPaginatedData(this.getSortedData(this.getFilteredData()));
    if (selected) {
      pageData.forEach(row => this.selectedRows.add(String(row.id)));
    } else {
      pageData.forEach(row => this.selectedRows.delete(String(row.id)));
    }
    this.render();
    if (this.onSelectionChange) {
      this.onSelectionChange(Array.from(this.selectedRows));
    }
  }
  
  getSelectedRows() {
    return this.data.filter(row => this.selectedRows.has(String(row.id)));
  }
  
  setLoading(loading) {
    this.isLoading = loading;
    this.render();
  }
  
  refresh() {
    this.render();
  }
}

window.DataTable = DataTable;
