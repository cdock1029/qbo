'use strict';

import React from 'react/addons';
import moment from 'moment';
import {PanelGroup, Panel, ListGroup, ListGroupItem, Badge} from 'react-bootstrap';
import _ from 'underscore';
import accounting from 'accounting';

const Invoices = React.createClass({

    propTypes: {
      expanded: React.PropTypes.bool,
      invoices: React.PropTypes.object
    },

    //mixins: [React.addons.PureRenderMixin],

    render() {
      const panels = this.props.invoices.map(function(invoice, index) {
        let lines = invoice.get('Line').filter( entry => {
          return entry.get('DetailType') === 'SalesItemLineDetail';
        });
          let descriptionLabel;
          let firstLineItem = lines.get(0);
          if (!lines.size) {
              descriptionLabel = '(Unlabeled Charge)';
          } else if (lines.size === 1) {
              descriptionLabel = firstLineItem.getIn(['SalesItemLineDetail', 'ItemRef', 'name']);
          } else {
              descriptionLabel = invoice.get('PrivateNote') || firstLineItem.getIn(['SalesItemLineDetail', 'ItemRef', 'name']);
              descriptionLabel += '...';
          }
          let style = {
              display: 'inline-block',
              marginRight: '2px'
          };
          let header = [
              <small className="pull-right" key="0">{descriptionLabel}</small>,
              <span key="1">{moment(invoice.get('TxnDate')).format('MMM Do, YYYY') + '  '}</span>,
              <span className="label label-default" key="3" style={style}>{accounting.formatMoney(invoice.get('Balance'))}</span>
          ];

          let listGroupItems = lines.map((line, i) => {
            return <ListGroupItem key={i}><Badge>{accounting.formatMoney(line.get('Amount'))}</Badge>{line.getIn(['SalesItemLineDetail', 'ItemRef', 'name'])}</ListGroupItem>;
          }).toJS();//TODO refactor when immutable object can be rendered correctly in Bootstrap

          let taxLine = invoice.hasIn(['TxnTaxDetail', 'TotalTax']) && <ListGroupItem key={'tax'}><Badge>{accounting.formatMoney(invoice.getIn(['TxnTaxDetail', 'TotalTax']))}</Badge>Tax</ListGroupItem>;
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
      }, this).toJS();//TODO refactor when immutable object can be rendered correctly in Bootstrap
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
