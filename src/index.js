import React, { Component } from 'react';
import PropTypes from 'prop-types';

var _ = require('underscore');
var proxy = require('nodeproxy');
var elementResizeEvent = require('element-resize-event');

import Table from './Table';
import Row from './Row';
import Cell from './Cell';

/**
 * StickyTable Component
 * Responsive, dynamically sized fixed headers and columns for tables
 * ------------------------------------------------------------------
 * Intentionally not setting state because we don't want to require
 * a full re-render every time the user scrolls or changes the
 * width of a cell.
 */
class StickyTable extends Component {
  constructor(props) {
    super(props);

    this.id = Math.floor(Math.random() * 1000000000) + '';

    this.rowCount = 0;
    this.columnCount = 0;
    this.xScrollSize = 0;
    this.yScrollSize = 0;

    this.suppressScroll = false;

    this.stickyHeaderCount = props.stickyHeaderCount === 0 ? 0 : (this.stickyHeaderCount || 1);

    this.onResize = this.onResize.bind(this);
    this.setScrollBarWrapperDims = this.setScrollBarWrapperDims.bind(this);
    this.onScrollX = this.onScrollX.bind(this);
    this.scrollXScrollbar = _.throttle(this.scrollXScrollbar.bind(this), 30);
    this.scrollYScrollbar = _.throttle(this.scrollYScrollbar.bind(this), 30);
  }

  componentDidMount() {
    this.table = document.getElementById('sticky-table-' + this.id);

    if (this.table) {
      this.realTable = this.table.querySelector('#sticky-table-x-wrapper').firstChild;
      this.xScrollbar = this.table.querySelector('#x-scrollbar');
      this.yScrollbar = this.table.querySelector('#y-scrollbar');
      this.xWrapper = this.table.querySelector('#sticky-table-x-wrapper');
      this.yWrapper = this.table.querySelector('#sticky-table-y-wrapper');
      this.stickyHeader = this.table.querySelector('#sticky-table-header');
      this.stickyColumn = this.table.querySelector('#sticky-table-column');
      this.stickyCorner = this.table.querySelector('#sticky-table-corner');

      this.xWrapper.addEventListener('scroll', this.onScrollX);

      elementResizeEvent(this.realTable, this.onResize);

      this.onResize();
      setTimeout(this.onResize);
      this.addScrollBarEventHandlers();
      this.setScrollBarWrapperDims();
    }
  }

  componentWillUnmount() {
    if (this.table) {
      this.xWrapper.removeEventListener('scroll', this.onScrollX);
    }
  }

  /**
   * Link scrolling on either axis to scrolling in the scrollbar elements
   * @returns {null} no return necessary
   */
  addScrollBarEventHandlers() {
    //X Scrollbars
    this.xWrapper.addEventListener('scroll', this.scrollXScrollbar);
    this.xScrollbar.addEventListener('scroll', proxy(_.throttle(this.onScrollBarX, 30), this));

    //Y Scrollbars
    this.yWrapper.addEventListener('scroll', this.scrollYScrollbar);
    this.yScrollbar.addEventListener('scroll', proxy(_.throttle(this.onScrollBarY, 30), this));
  }

  onScrollBarX = () => {
    if (!this.suppressScroll) {
      this.xWrapper.scrollLeft = this.xScrollbar.scrollLeft;
      this.suppressScroll = true;
    } else {
      this.suppressScroll = false;
    }
  }

  onScrollBarY = () => {
    if (!this.suppressScroll) {
      this.yWrapper.scrollTop = this.yScrollbar.scrollTop;
      this.suppressScroll = true;
    } else {
      this.suppressScroll = false;
    }
  }

  onScrollX() {
    var scrollLeftWrapper = Math.max(this.xWrapper.scrollLeft, 0);
    var scrollLeftScrollbar = Math.max(this.xScrollbar.scrollLeft, 0);
    var scrollLeft = Math.min(scrollLeftWrapper, scrollLeftScrollbar);

    this.stickyHeader.style.transform = 'translate(' + (-1 * scrollLeft) + 'px, 0)';
  }

  scrollXScrollbar() {
    if (!this.suppressScroll) {
      this.xScrollbar.scrollLeft = this.xWrapper.scrollLeft;
      this.suppressScroll = true;
    } else {
      this.suppressScroll = false;
    }
  }

  scrollYScrollbar() {
    if (!this.suppressScroll) {
      this.yScrollbar.scrollTop = this.yWrapper.scrollTop;
      this.suppressScroll = true;
    } else {
      this.suppressScroll = false;
    }
  }

  /**
   * Handle real cell resize events
   * @returns {null} no return necessary
   */
  onResize() {
    this.setRowHeights();
    this.setColumnWidths();
    this.setScrollBarDims();
  }

  setScrollBarPaddings() {
    var scrollPadding = '0px 0px ' + this.xScrollSize + 'px 0px';
    this.table.style.padding = scrollPadding;


    var scrollPadding = '0px ' + this.yScrollSize + 'px 0px 0px';
    this.xWrapper.firstChild.style.padding = scrollPadding;
  }

  setScrollBarWrapperDims() {
    this.xScrollbar.style.width = 'calc(100% + ' + this.yScrollSize + 'px)';
    this.yScrollbar.style.height = 'calc(100% - ' + this.stickyHeader.offsetHeight + 'px)';
    this.yScrollbar.style.top = this.stickyHeader.offsetHeight + 'px';
  }

  setScrollBarDims() {
    this.xScrollSize = this.xScrollbar.offsetHeight - this.xScrollbar.clientHeight;
    this.yScrollSize = this.yScrollbar.offsetWidth - this.yScrollbar.clientWidth;
    this.setScrollBarPaddings();

    var width = this.getSizeWithoutBoxSizing(this.realTable.firstChild).width + this.yScrollSize;
    this.xScrollbar.firstChild.style.width = width + 'px';

    var height = this.getSizeWithoutBoxSizing(this.realTable).height - this.stickyHeader.offsetHeight;
    this.yScrollbar.firstChild.style.height = height + 'px';
  }

  /**
   * Get the height of each row in the table
   * @returns {null} no return necessary
   */
  setRowHeights() {
    var r, cellToCopy, height;

    if (this.props.stickyColumnsCount) {
      for (r = 0; r < this.rowCount; r++) {
        cellToCopy = this.realTable.childNodes[r].firstChild;

        if (cellToCopy) {
          height = this.getSizeWithoutBoxSizing(cellToCopy).height;

          this.stickyColumn.firstChild.childNodes[r].firstChild.style.height = height + 'px';

          if (r === 0 && this.stickyCorner.firstChild.firstChild) {
            this.stickyCorner.firstChild.firstChild.firstChild.style.height = height + 'px';
          }
        }
      }
    }
  }

  /**
   * Get the width of each column in the table
   * @returns {null} no return necessary
   */
  setColumnWidths() {
    var c, cellToCopy, cellStyle, width, cell, stickyWidth;

    if (this.stickyHeaderCount) {
      stickyWidth = 0;

      for (c = 0; c < this.columnCount; c++) {
        cellToCopy = this.realTable.firstChild.childNodes[c];

        if (cellToCopy) {
          width = this.getSizeWithoutBoxSizing(cellToCopy).width;

          cell = this.table.querySelector('#sticky-header-cell-' + c);

          cell.style.width = width + 'px';
          cell.style.minWidth = width + 'px';

          if (this.stickyCorner.firstChild.firstChild.childNodes[c]) {
            cell = this.stickyCorner.firstChild.firstChild.childNodes[c];
            cell.style.width = width + 'px';
            cell.style.minWidth = width + 'px';

            cell = this.stickyColumn.firstChild.firstChild.childNodes[c];
            cell.style.width = width + 'px';
            cell.style.minWidth = width + 'px';

            stickyWidth += width;
          }
        }
      }

      this.stickyColumn.firstChild.style.width = stickyWidth + 'px';
      this.stickyColumn.firstChild.style.minWidth = stickyWidth + 'px';
    }
  }

  /**
   * Get the jsx cells for sticky columns by copying
   * children elements
   * @param {array} rows provided child row elements
   * @returns {array} array of <Row> elements for sticky column
   */
  getStickyColumns(rows) {
    const columnsCount = this.props.stickyColumnsCount;
    var cells;
    var stickyRows = [];

    rows.forEach(proxy((row, r) => {
      cells = React.Children.toArray(row.props.children);

      stickyRows.push(
        <Row {...row.props} id='' key={r}>
          {cells.slice(0, columnsCount)}
        </Row>
      );
    }, this));

    return stickyRows;
  }

  /**
   * Get the jsx header cells and row by copying
   * children elements
   * @param {array} rows provided child row elements
   * @returns {jsx} <Row> of <Cell> elements for sticky header
   */
  getStickyHeader(rows) {
    var row = rows[0];
    var cells = [];

    React.Children.toArray(row.props.children).forEach((cell, c) => {
      cells.push(React.cloneElement(cell, {id: 'sticky-header-cell-' + c, key: c}));
    });

    return (
      <Row {...row.props} id='sticky-header-row'>
        {cells}
      </Row>
    );
  }

  /**
   * Get the jsx cells for sticky columns by copying
   * children elements
   * @param {array} rows provided child row elements
   * @returns {array} array of <Row> elements for sticky column
   */
  getStickyCorner(rows) {
    const columnsCount = this.props.stickyColumnsCount;
    var cells;
    var stickyCorner = [];

    rows.forEach(proxy((row, r) => {
      if (r === 0) {
        cells = React.Children.toArray(row.props.children);

        stickyCorner.push(
          <Row {...row.props} id='' key={r}>
            {cells.slice(0, columnsCount)}
          </Row>
        );
      }
    }, this));

    return stickyCorner;
  }

  /**
   * Fill for browsers that don't support getComputedStyle (*cough* I.E.)
   * @param  {object} node dom object
   * @return {object} style object
   */
  getStyle(node) {
    var browserSupportsComputedStyle = typeof getComputedStyle !== 'undefined';

    return browserSupportsComputedStyle ? getComputedStyle(node, null) : node.currentStyle;
  }

  /**
   * Get innerWidth and innerHeight of elements
   * @param  {object} node dom object
   * @return {object} dimensions
   */
  getSizeWithoutBoxSizing(node) {
    var nodeStyle = this.getStyle(node);
    var width = node.getBoundingClientRect().width;
    var height = node.getBoundingClientRect().height;

    return {width, height};
  }

  /**
   * Get the column and header to render
   * @returns {null} no return necessary
   */
  render() {
    var rows = React.Children.toArray(this.props.children);
    var stickyColumn, stickyHeader, stickyCorner;

    this.rowCount = rows.length;
    this.columnCount = (rows[0] && React.Children.toArray(rows[0].props.children).length) || 0;

    if (rows.length) {
      if (this.props.stickyColumnsCount > 0 && this.stickyHeaderCount > 0) {
        stickyCorner = this.getStickyCorner(rows);
      }
      if (this.props.stickyColumnsCount > 0) {
        stickyColumn = this.getStickyColumns(rows);
      }
      if (this.stickyHeaderCount > 0) {
        stickyHeader = this.getStickyHeader(rows);
      }
    }

    return (
      <div className={'sticky-table ' + (this.props.className || '')} id={'sticky-table-' + this.id}>
        <div id='x-scrollbar'><div></div></div>
        <div id='y-scrollbar'><div></div></div>
        <div className='sticky-table-corner' id='sticky-table-corner'>
          <Table>{stickyCorner}</Table>
        </div>
        <div className='sticky-table-header' id='sticky-table-header'>
          <Table>{stickyHeader}</Table>
        </div>
        <div className='sticky-table-y-wrapper' id='sticky-table-y-wrapper'>
          <div className='sticky-table-column' id='sticky-table-column'>
            <Table>{stickyColumn}</Table>
          </div>
          <div className='sticky-table-x-wrapper' id='sticky-table-x-wrapper'>
            <Table>{rows}</Table>
          </div>
        </div>
      </div>
    );
  }
}

StickyTable.propTypes = {
  rowCount: PropTypes.number, //Including header
  columnCount: PropTypes.number
};

export {StickyTable, Table, Row, Cell};
