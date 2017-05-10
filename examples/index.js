import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import '../src/sticky-table.css';
import '../src/Cell/index.css';
import '../src/Row/index.css';
import '../src/Table/index.css';
import './index.css';
import { StickyTable, Table, Row, Cell } from '../src/index';

class Example extends Component {
    handleScroll = ({scrollTop, scrollHeight, clientHeight}) => {
        console.log(scrollTop, scrollHeight, clientHeight);
    }

    render() {
        var rows = [];
        var cells;

        for (var r = 0; r < 30; r++) {
            cells = [];

            for (var c = 0; c < 50; c++) {
                cells.push(
                    <Cell key={c}>
                        {r === 0 ? 'HEAD' + c : 'Cell' + r + c + '\n Content'}
                    </Cell>
                );
            }

            rows.push(<Row key={r}>{cells}</Row>);
        }

        return (
            <div style={{width: '700px', height: '300px'}}>
                <StickyTable onScroll={this.handleScroll} stickyColumnsCount={2}>
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
