import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import '../src/sticky-table.css';
import '../src/Cell/index.css';
import '../src/Row/index.css';
import '../src/Table/index.css';
import './index.css';
import { StickyTable, Table, Row, Cell } from '../src/index';

class Example extends Component {
    render() {
        var rows = [];
        var cells;

        for (var r = 0; r < 30; r++) {
            cells = [];

            for (var c = 0; c < 250; c++) {
                cells.push(
                    <Cell key={c}>
                        {r === 0 ? 'HEAD' + c : 'Cell' + r + c + '\n Content'}
                    </Cell>
                );
            }

            rows.push(<Row key={r}>{cells}</Row>);
        }

        return (
            <div style={{width: '900px', height: '500px'}}>
                <StickyTable stickyColumnsCount={2}>
                    {rows}
                </StickyTable>
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
