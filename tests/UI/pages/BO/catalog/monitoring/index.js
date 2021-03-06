require('module-alias/register');
const BOBasePage = require('@pages/BO/BObasePage');

module.exports = class Monitoring extends BOBasePage {
  constructor(page) {
    super(page);

    this.pageTitle = 'Monitoring •';

    // Selectors
    this.gridPanel = table => `#${table}_grid_panel`;
    this.gridTable = table => `#${table}_grid_table`;
    this.gridHeaderTitle = table => `${this.gridPanel(table)} div.card-header h3`;
    // Filters
    this.filterColumn = (table, filterBY) => `${this.gridTable(table)} #${table}_${filterBY}`;
    this.filterSearchButton = table => `${this.gridTable(table)} .grid-search-button`;
    this.filterResetButton = table => `${this.gridTable(table)} .grid-reset-button`;
    // Table
    this.tableBody = table => `${this.gridTable(table)} tbody`;
    this.tableRow = (table, row) => `${this.tableBody(table)} tr:nth-child(${row})`;
    this.tableEmptyRow = table => `${this.tableBody(table)} tr.empty_row`;
    this.tableColumn = (table, row, column) => `${this.tableRow(table, row)} td.column-${column}`;
    // enable column
    this.enableColumn = (table, row) => this.tableColumn(table, row, 'active');
    this.enableColumnValidIcon = row => `${this.enableColumn(row)} i.grid-toggler-icon-valid`;
    // Actions buttons in Row
    this.actionsColumn = (table, row) => `${this.tableRow(table, row)} td.column-actions`;
    this.editRowLink = (table, row) => `${this.actionsColumn(table, row)} a.grid-edit-row-link`;
    this.dropdownToggleButton = (table, row) => `${this.actionsColumn(table, row)} a.dropdown-toggle`;
    this.dropdownToggleMenu = (table, row) => `${this.actionsColumn(table, row)} div.dropdown-menu`;
    this.deleteRowLink = (table, row) => `${this.dropdownToggleMenu(table, row)} a.grid-delete-row-link`;
    // Category selectors
    this.viewCategoryRowLink = row => `${this.actionsColumn('empty_category', row)} a.grid-view-row-link`;
    this.editCategoryRowLink = row => `${this.dropdownToggleMenu('empty_category', row)} a.grid-edit-row-link`;
    this.deleteCategoryRowLink = row => `${this.dropdownToggleMenu('empty_category', row)
    } a.grid-delete-row-link`;
    this.deleteModeCategoryModal = '#empty_category_grid_delete_categories_modal';
    this.deleteModeInput = position => `#delete_categories_delete_mode_${position}`;
    this.deleteModeCategoryModalDiv = '#delete_categories_delete_mode';
    this.submitDeleteCategoryButton = `${this.deleteModeCategoryModal} button.js-submit-delete-categories`;
    // Sort Selectors
    this.tableHead = table => `${this.gridTable(table)} thead`;
    this.sortColumnDiv = (table, column) => `${this.tableHead(table)
    } div.ps-sortable-column[data-sort-col-name='${column}']`;
    this.sortColumnSpanButton = (table, column) => `${this.sortColumnDiv(table, column)} span.ps-sort`;

    // Modal products list
    this.deleteProductModal = table => `#${table}-grid-confirm-modal`;
    this.submitDeleteProductButton = table => `${this.deleteProductModal(table)} button.btn-confirm-submit`;
  }

  /* Reset Methods */
  /**
   * Get number of element in table grid
   * @param table, which table to get number of element from
   * @return {Promise<number>}
   */
  async getNumberOfElementInGrid(table) {
    return this.getNumberFromText(this.gridHeaderTitle(table));
  }

  /**
   * Reset filters in table
   * @param table, which table to reset
   * @return {Promise<void>}
   */
  async resetFilter(table) {
    if (!(await this.elementNotVisible(this.filterResetButton(table), 2000))) {
      await this.clickAndWaitForNavigation(this.filterResetButton(table));
    }
  }

  /**
   * Reset Filter And get number of elements in list
   * @param table, which table to reset
   * @return {Promise<number>}
   */
  async resetAndGetNumberOfLines(table) {
    await this.resetFilter(table);
    return this.getNumberOfElementInGrid(table);
  }


  /* Filter Methods */
  /**
   * Filter Table
   * @param table, which table to filter
   * @param filterType, input / Select
   * @param filterBy, which column
   * @param value, value to put in filter
   * @return {Promise<void>}
   */
  async filterTable(table, filterType, filterBy, value = '') {
    switch (filterType) {
      case 'input':
        await this.setValue(this.filterColumn(table, filterBy), value);
        break;
      case 'select':
        await this.selectByVisibleText(this.filterColumn(table, filterBy), value ? 'Yes' : 'No');
        break;
      default:
        throw new Error(`Filter column not found : ${filterBy}`);
    }
    // click on search
    await this.clickAndWaitForNavigation(this.filterSearchButton(table));
  }

  /* table methods */
  /**
   * get text from a column
   * @param table, which table to get text from
   * @param row, row in table
   * @param column, which column
   * @return {Promise<string>}
   */
  async getTextColumnFromTable(table, row, column) {
    return this.getTextContent(this.tableColumn(table, row, column));
  }

  /**
   * Open dropdown menu in table
   * @param table
   * @param row
   * @return {Promise<void>}
   */
  async openDropdownMenu(table, row) {
    await Promise.all([
      this.page.click(this.dropdownToggleButton(table, row)),
      this.waitForVisibleSelector(`${this.dropdownToggleButton(table, row)}[aria-expanded='true']`),
    ]);
  }

  /**
   * Delete Row in table
   * @param table
   * @param row, row to delete
   * @return {Promise<string>}
   */
  async deleteProductInGrid(table, row) {
    await this.openDropdownMenu(table, row);

    // Click on delete and wait for modal
    await Promise.all([
      this.page.click(this.deleteRowLink(table, row)),
      this.waitForVisibleSelector(`${this.deleteProductModal(table)}.show`),
    ]);

    await this.clickAndWaitForNavigation(this.submitDeleteProductButton(table));
    return this.getTextContent(this.alertSuccessBlockParagraph);
  }

  /* Categories methods */
  /**
   * View category in table
   * @param row
   * @return {Promise<void>}
   */
  async viewCategoryInGrid(row) {
    await this.clickAndWaitForNavigation(this.viewCategoryRowLink(row));
  }

  /**
   * Go to edit category page
   * @param row
   * @return {Promise<void>}
   */
  async editCategoryInGrid(row) {
    await Promise.all([
      this.page.click(this.dropdownToggleButton(row)),
      this.waitForVisibleSelector(
        `${this.dropdownToggleButton(row)}[aria-expanded='true']`,
      ),
    ]);
    await this.clickAndWaitForNavigation(this.editCategoryRowLink(row));
  }

  /**
   * Delete Row in table empty categories
   * @param table
   * @param row, row to delete
   * @param deletionModePosition, which mode to choose for delete
   * @return {Promise<string>}
   */
  async deleteCategoryInGrid(table, row, deletionModePosition) {
    this.dialogListener(true);
    await this.openDropdownMenu(table, row);
    await Promise.all([
      this.page.click(this.deleteCategoryRowLink(row)),
      this.waitForVisibleSelector(this.deleteModeCategoryModal),
    ]);
    // choose deletion mode
    await this.page.click(this.deleteModeInput(deletionModePosition));
    await this.clickAndWaitForNavigation(this.submitDeleteCategoryButton);
    return this.getTextContent(this.alertSuccessBlockParagraph);
  }

  /**
   * Get toggle column value for a row
   * @param table
   * @param row
   * @return {Promise<boolean>}
   */
  async getToggleColumnValue(table, row = 1) {
    return this.elementVisible(this.enableColumnValidIcon(table, row), 100);
  }

  // Sort methods
  /**
   * Get content from all rows
   * @param table
   * @param column
   * @return {Promise<[]>}
   */
  async getAllRowsColumnContent(table, column) {
    const rowsNumber = await this.getNumberOfElementInGrid(table);
    const allRowsContentTable = [];
    for (let i = 1; i <= rowsNumber; i++) {
      let rowContent = await this.getTextContent(this.tableColumn(table, i, column));
      if (column === 'active') {
        rowContent = await this.getToggleColumnValue(table, i).toString();
      }
      await allRowsContentTable.push(rowContent);
    }
    return allRowsContentTable;
  }

  /**
   * Sort table
   * @param table
   * @param sortBy, column to sort with
   * @param sortDirection, asc or desc
   * @return {Promise<void>}
   */
  async sortTable(table, sortBy, sortDirection = 'asc') {
    const sortColumnDiv = `${this.sortColumnDiv(table, sortBy)}[data-sort-direction='${sortDirection}']`;
    const sortColumnSpanButton = this.sortColumnSpanButton(table, sortBy);
    let i = 0;
    while (await this.elementNotVisible(sortColumnDiv, 1000) && i < 2) {
      await this.clickAndWaitForNavigation(sortColumnSpanButton);
      i += 1;
    }
    await this.waitForVisibleSelector(sortColumnDiv);
  }
};
