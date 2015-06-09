'use strict';

import React from 'react/addons';
import {DropdownButton, MenuItem, Navbar, Nav, NavItem} from 'react-bootstrap';
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
        <Navbar brand="Waldon Management" fixedTop inverse toggleNavKey={0}>
          <Nav collapsable defaultNavExpanded={true} eventKey={0} right>
            <DropdownButton data-toggle="dropdown" eventKey={1} title={selectedLabel}>
              {menuItems}
            </DropdownButton>
            <NavItem eventKey={2} href="/logout"><span className="glyphicon glyphicon-log-out"></span> Logout</NavItem>
          </Nav>
        </Navbar>
      );
    }
});

module.exports = CompanyDropdownButton;
