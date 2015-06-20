'use strict';

import React from 'react/addons';
import moment from 'moment';
import accounting from 'accounting';

const Invoices = React.createClass({

    propTypes: {
      expanded: React.PropTypes.bool,
      invoices: React.PropTypes.object
    },

    shouldComponentUpdate(nextProps, nextState) {
      return nextProps.invoices !== this.props.invoices ||
          nextProps.expanded !== this.props.expanded;
    },

    render() {
      console.log('..inv render');
      const feeds = this.props.invoices && this.props.invoices.map(function(invoice, index) {
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
          /*let style = {
              display: 'inline-block',
              marginRight: '2px'
          };
          let header = [
              <small className="pull-right" key="0">{descriptionLabel}</small>,
              <span key="1">{moment(invoice.get('TxnDate')).format('MMM Do, YYYY') + '  '}</span>,
              <span className="label label-default" key="3" style={style}>{accounting.formatMoney(invoice.get('Balance'))}</span>
          ];*/

          let listGroupItems = lines.map((line, i) => {
            return <div key={i}><div>{accounting.formatMoney(line.get('Amount'))}</div>{line.getIn(['SalesItemLineDetail', 'ItemRef', 'name'])}</div>;
          }).toJS();//TODO refactor when immutable object can be rendered correctly in Bootstrap

          let taxLine = invoice.hasIn(['TxnTaxDetail', 'TotalTax']) && <div key={'tax'}><div>{accounting.formatMoney(invoice.getIn(['TxnTaxDetail', 'TotalTax']))}</div>Tax</div>;
          if (taxLine) {
            listGroupItems.push(taxLine);
          }
          return (
            <div className="ui small feed" key={index}>
              <div className="event">
                <div className="label">
                  <i className="pencil icon"></i>
                </div>
                <div className="content">
                  <div className="summary">
                    {descriptionLabel}
                    <div className="date">
                      {moment(invoice.get('TxnDate')).format('MMM Do, YYYY')}
                    </div>
                  </div>
                  <div className="meta">
                    <a className="like">
                      <i className="large money icon"></i> {accounting.formatMoney(invoice.get('Balance'))}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
      }, this).toJS();//TODO refactor when immutable object can be rendered correctly in Bootstrap
        return (
          this.props.invoices ?
            <div>
              {feeds}
            </div>
          : null
        );
    }
});

module.exports = Invoices;
