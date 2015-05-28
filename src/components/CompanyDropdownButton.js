'use strict';

import React from 'react/addons';
import {DropdownButton, MenuItem} from 'react-bootstrap';
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
          return <MenuItem className="companyItems" eventKey={index} key={index}>{company.name}</MenuItem>;
      });
      return (
          <DropdownButton data-toggle="dropdown" title={selectedLabel}>
              {menuItems}
          </DropdownButton>
      );
    }
});

module.exports = CompanyDropdownButton;
