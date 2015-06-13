'use strict';

import React from '../../../../node_modules/react/addons';
import moment from 'moment';
import {PanelGroup, Panel, ListGroup, ListGroupItem, Badge} from 'react-bootstrap';
import _ from 'underscore';
import accounting from 'accounting';

const Invoices = React.createClass({

    //mixins: [React.addons.PureRenderMixin],

    render() {
      const panels = this.props.invoices.map(function(invoice, index) {

        let lines = _(invoice.Line).where({DetailType: 'SalesItemLineDetail'});

          let descriptionLabel;
          let firstLineItem = lines[0];
          if (!lines.length) {
              descriptionLabel = '(Unlabeled Charge)';
          } else if (lines.length === 1) {
              descriptionLabel = firstLineItem.SalesItemLineDetail.ItemRef.name;
          } else {
              descriptionLabel = invoice.PrivateNote || firstLineItem.SalesItemLineDetail.ItemRef.name;
              descriptionLabel += '...';
          }
          let style = {
              display: 'inline-block',
              marginRight: '2px'
          };
          let header = [
              <small className="pull-right" key="0">{descriptionLabel}</small>,
              <span key="1">{moment(invoice.TxnDate).format('MMM Do, YYYY') + '  '}</span>,
              <span className="label label-default" key="3" style={style}>{accounting.formatMoney(invoice.Balance)}</span>
          ];

          let listGroupItems = _(lines).map((line, i) => {
            return <ListGroupItem key={i}><Badge>{accounting.formatMoney(line.Amount)}</Badge>{line.SalesItemLineDetail.ItemRef.name}</ListGroupItem>;
          });

          let tax = invoice.TxnTaxDetail;
          let taxLine = tax && tax.TotalTax && <ListGroupItem key={'tax'}><Badge>{accounting.formatMoney(tax.TotalTax)}</Badge>Tax</ListGroupItem>;
          if (taxLine) {
            listGroupItems.push(taxLine);
          }

          return (
              <Panel collapsable={this.props.expanded} defaultExpanded={false} header={header} key={index}>
                  <ListGroup fill>
                      {listGroupItems}
                  </ListGroup>
              </Panel>
          );
      }, this);
        return (
            this.props.invoices ?
                <PanelGroup>
                    {panels}
                </PanelGroup>
            : null
        );
    }
});

module.exports = Invoices;
