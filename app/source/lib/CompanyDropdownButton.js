'use strict';

import React from 'react/addons';
import PayButton from './PayButton';
import _ from 'underscore';


const CompanyDropdownButton = React.createClass({

    propTypes: {
      companies: React.PropTypes.array
    },

    render() {

      const companies = this.props.companies;
      let selectedLabel;
      const menuItems = _(companies).map( (company, index) => {
          if (company.isSelected) {
              selectedLabel = company.name + ' ';
          }
          return <div className="item companyItems" key={index}>{company.name}</div>;
      });
      return (
          <div className="ui menu fixed grid">
            <a className="ui header teal item">Waldon Management</a>
            <div className="right menu">
              <div className="item" id="payButtonContainer">
                <PayButton />
              </div>
              <a className="ui dropdown item">
                <div className="text">{selectedLabel}</div>
                <i className="dropdown icon"></i>
                <div className="menu">
                  {menuItems}
                </div>
              </a>
              <a className="item" href="/logout">Logout <i className="sign out icon"></i></a>
            </div>
          </div>
      );
    }
});

module.exports = CompanyDropdownButton;
