import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import '../src/sticky-table.css';
import '../src/Cell/index.css';
import '../src/Row/index.css';
import '../src/Table/index.css';
import './index.css';
import { StickyTable, Table, Row, Cell } from '../src/index';

class Example extends Component {
    state = {
        renderTable: true,
        locked: 2
    };

    handleLocked = (inc) => {
        var locked = inc ? ++this.state.locked : --this.state.locked;

        this.setState({
            locked: Math.max(locked, 0)
        });
    }

    handleToggle = () => {
        this.setState({
            renderTable: !this.state.renderTable
        });
    }

    handleScroll(object) {
        //console.log(object);
    }

    render() {
        var rows = [];
        var cells;

        for (var r = 1; r <= 30; r++) {
            cells = [];

            for (var c = 1; c <= 50; c++) {
                cells.push(
                    <Cell key={c}>
                        { r == 1 && `Column${c}` }
                        { r != 1 && `Cell ${c} of row ${r}`}
                    </Cell>
                );
            }

            rows.push(<Row key={r}>{cells}</Row>);
        }

        return (
            <div>
                {
                    this.state.renderTable ? (
                        <div style={{width: '900px', height: '300px'}}>
                            <StickyTable onScroll={this.handleScroll} stickyColumnsCount={this.state.locked}>
                                {rows}
                            </StickyTable>
                        </div>
                    )
                    : null
                }

                <button onClick={this.handleToggle}>Toggle</button>
                <button onClick={() => this.handleLocked(true)}>Fixed +</button>
                <button onClick={() => this.handleLocked()}>Fixed -</button>
            </div>
        );
    }
}

window.onload = () => {
    ReactDOM.render(
        <Example/>,
        document.getElementById('example')
    );
};
