<%--
/**
 * Copyright (c) 2000-2013 Liferay, Inc. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or modify it under
 * the terms of the GNU Lesser General Public License as published by the Free
 * Software Foundation; either version 2.1 of the License, or (at your option)
 * any later version.
 *
 * This library is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Lesser General Public License for more
 * details.
 */
--%>

<%@ taglib uri="http://java.sun.com/portlet_2_0" prefix="portlet" %>
<%@ taglib uri="http://liferay.com/tld/ui" prefix="liferay-ui" %>
<%@ taglib uri="http://java.sun.com/jstl/core_rt" prefix="c" %>
<%@ taglib uri="http://liferay.com/tld/aui" prefix="aui" %>
<portlet:defineObjects />
<c:set var="pns" scope="request"><portlet:namespace /></c:set>


<aui:script use="skype-portlet">
    var skype = new A.Skype({
        container: A.one('#<portlet:namespace/>'),
        resourceUrl: '<portlet:resourceURL />',
        portletNamespace: '${pns}',
        usersPerPage: ${prefBean.usersPerPage},
        groupsPerPage: ${prefBean.groupsPerPage}
    });
</aui:script>

<div class="skype-portlet">
    <script type="text/javascript" src="http://www.skypeassets.com/i/scom/js/skype-uri.js"></script>

    <script id="${pns}item-template" type="text/x-handlebars-template">
        <li class="{{type}}-chat" skypeid="{{skypeid}}" user="{{user-id}}">
            {{first-name}} {{last-name}}
            <span class="icon-{{type}}"></span>
            <span class="handle"></span>
        </li>
    </script>

    <script id="${pns}pagination-template" type="text/x-handlebars-template">
        <ul id="${pns}users-table-pagination" class="pagination-content">
            <li class="pagination-control" id="${pns}pagination-first"><a href="#">&laquo;</a></li>
            <li class="pagination-control" id="${pns}pagination-previous"><a href="#">&lsaquo;</a></li>
            {{#items}}
                {{#if isCurrent}}
                   <li class="pagination-number active"><a href="#">{{number}}</a></li>
                {{else}}
                    <li class="pagination-number"><a href="#">{{number}}</a></li>
                {{/if}}
            {{/items}}
            <li class="pagination-control" id="${pns}pagination-next"><a href="#">&rsaquo;</a></li>
            <li class="pagination-control" id="${pns}pagination-last"><a href="#">&raquo;</a></li>
        </ul>
    </script>

    <script id="${pns}table-template" type="text/x-handlebars-template">
        <table class="aui table table-bordered table-hover table-striped skype-users">
            <thead>
                <tr>
                    {{#if isOrderedName}}
                        {{#if nameAsc}}
                            <th id="${pns}name" class="table-sortable-column table-sorted-desc">
                        {{else}}
                            <th id="${pns}name" class="table-sortable-column table-sorted">
                        {{/if}}
                    {{else}}
                             <th id="${pns}name" class="table-sortable-column">
                    {{/if}}
                        <div class="table-sort-liner">
                            <liferay-ui:message key="first-name"/> <span class="table-sort-indicator"></span>
                        </div>
                    </th>

                    {{#if isOrderedLastName}}
                        {{#if lastNameAsc}}
                            <th id="${pns}lastname" class="table-sortable-column table-sorted-desc">
                        {{else}}
                            <th id="${pns}lastname" class="table-sortable-column table-sorted">
                        {{/if}}
                    {{else}}
                             <th id="${pns}lastname" class="table-sortable-column">
                    {{/if}}
                        <div class="table-sort-liner">
                            <liferay-ui:message key="last-name"/> <span class="table-sort-indicator"></span>
                        </div>
                    </th>
                    <th id="${pns}skype"><liferay-ui:message key="skype"/></th>
                    <th id="${pns}phone"><liferay-ui:message key="phone-number"/></th>
                </tr>
            </thead>
            <tbody>
                {{#users}}
                <tr>
                    <td>{{first-name}}</td>
                    <td>{{last-name}}</td>
                    <td>
                        {{#if skype-sn}}
                            <span class="icon-skype" title="{{skype-sn}}" user="{{user-id}}"></span>
                        {{/if}}
                    </td>
                    <td>
                       {{#if primary-phone}}
                            <span class="icon-phone" title="{{primary-phone}}" user="{{user-id}}"></span>
                        {{/if}}
                    </td>
                </tr>
                {{/users}}
            </tbody>
        </table>
    </script>

    <script id="${pns}groups-template" type="text/x-handlebars-template">
        <h4><liferay-ui:message key="label.saved.groups"/></h4>
        <ul id="${pns}groups" class="groups">
            {{#each groups}}
            <li>
                <span class="group-label">{{skype-group-name}}</span>
                <ul class="group-options">
                    <li class="icon-folder-open" group-id={{skype-group-id}}></li>
                    <li class="icon-pencil"></li>
                    <li class="icon-remove"></li>   
                </ul>
                <div class="edit-group">
                    <input type="text">
                    <button class="btn save-edit-group list-item"><liferay-ui:message key="save"/></button>
                    <button class="btn cancel-edit-group"><liferay-ui:message key="cancel"/></button>
                </div>
            </li>
            {{/each}}
    </script>

<div id="${pns}modal" class="skype-modal"></div>
<div class="skype-users-to-call">
    <h3 id="${pns}group-name" class="skype-group-name">
    	<span><liferay-ui:message key="label.unnamed.group"/></span> 
    	<i class="icon-pencil"></i>
    </h3>
    <div class="edit-group">
    	<input type="text">
    	<button class="btn save-edit-group"><liferay-ui:message key="save"/></button>
        <button class="btn cancel-edit-group"><liferay-ui:message key="cancel"/></button>
    </div>
	<ul class="users" id="${pns}users">
	</ul>
	<button id="${pns}skype-open" class="btn"><liferay-ui:message key="action.open.skype"/></button>
    <button id="${pns}skype-call" class="btn group"><i class="icon-phone"></i><liferay-ui:message key="action.open.skype"/>Call in Skype</button>
    <button id="${pns}skype-save" class="btn group"><i class="icon-save"></i><liferay-ui:message key="action.save.group"/></button>
    <button id="${pns}skype-load" class="btn group"><i class="icon-undo"></i><liferay-ui:message key="action.open.groups"/></button>
    <div class="portlet-msg-error"><liferay-ui:message key="error.message.select.one.user"/></div>
    <div id="${pns}groups-list" class="groups-list">
        <div class="groups-wrapper">
        </div>
        <div class="groups-pagination pagination pagination-small">
        </div>
    </div>
    <div id="${pns}group-save" class="group-save">
        <label><liferay-ui:message key="label.save.as"/>:</label>
        <input type="text" id="${pns}group-name-edit">
        <button id="${pns}skype-save-as" class="btn group"><i class="icon-save"></i><liferay-ui:message key="save"/></button>
    </div>
</div>

<div id="${pns}users-table"></div>
<div id="${pns}table-pagination" class="pagination"></div>
</div>