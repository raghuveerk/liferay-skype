/**
 * Copyright (C) 2005-2014 Rivet Logic Corporation.
 * 
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; version 3 of the License.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 * 
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 51
 * Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */

AUI.add('skype-portlet', function (Y, NAME) {
    Y.Skype = Y.Base.create('skype-portlet', Y.Base, [], {
        html: "",
        dataTable: {},
        data: {},
        currentPage: 1,
        total: 0,
        nameAsc: false,
        lastNameAsc: false,
        isOrderedName: false,
        isOrderedLastName: false,
        itemsOnPaginator: 15,
        groupsPaginator: null,

/** -------------------------------- AJAX CALLS ---------------------------------/*
/**
 *  Executes an ajax call
 * 
 */
        executeAjax: function (configuration, callback, responseURL) {
            var url = responseURL ? responseURL : this.get('resourceUrl'),
                me = this;
            Y.io.request(url, {
                method: configuration.method,
                data: configuration.data,
                dataType: 'json',
                on: {
                    success: function (e) {
                        var data = this.get('responseData');
                        me.total = data.total;
                        callback(data);
                    }
                }
            });
        },

        /**
         *  Retrieves the users, using the current usersPerPage (delta) and currentPage.
         *  After retrieving the data, checks if data is ordered (by name or last name),
         *  and if it is, whether is ascending or descending order, to add the correspondant
         *  properties to the json that renders the table (so that it prints the arrows
         *  on the table header).
         *
         */
        listUsersCall: function () {
            var me = this,
                rawData = {
                    cmd: 'list-users',
                    delta: me.get('usersPerPage'),
                    curPage: me.currentPage
                };

            // Verify whether the user has ordered the columns so that they keep
            // appearing with that order
            if (me.isOrderedName) {
                rawData.orderByCol = 'first-name';
                rawData.isAsc = me.nameAsc;
            } else {
                if (me.isOrderedLastName) {
                    rawData.orderByCol = 'last-name';
                    rawData.isAsc = me.lastNameAsc;
                }
            }
            var data = Liferay.Util.ns(
            this.get('portletNamespace'), rawData);
            this.executeAjax({
                method: 'GET',
                data: data
            }, function (d) {
                if (me.isOrderedName) {
                    d.isOrderedName = me.isOrderedName;
                    if (me.nameAsc) {
                        d.nameAsc = me.nameAsc;
                    }
                }
                if (me.isOrderedLastName) {
                    d.isOrderedLastName = me.isOrderedLastName;
                    if (me.lastNameAsc) {
                        d.lastNameAsc = me.lastNameAsc;
                    }
                }
                me.renderTable(d);
                me.renderPagination();
            });
        },


        /**
         *  Retrieves the users, but ordered by their first name.
         *  Sets the object variables isOrderedName and nameAsc (if it is set in ascending order)
         *  so that pagination keeps using that order.
         */
        orderByName: function () {
            this.nameAsc = !this.nameAsc;
            var me = this,
                data = Liferay.Util.ns(
                this.get('portletNamespace'), {
                    cmd: 'list-users',
                    orderByCol: 'first-name',
                    delta: me.get('usersPerPage'),
                    curPage: me.currentPage,
                    isAsc: me.nameAsc
                });

            this.executeAjax({
                method: 'GET',
                data: data
            }, function (d) {
                d.isOrderedName = true;
                if (me.nameAsc) {
                    d.nameAsc = true;
                }
                me.renderTable(d);
            });
        },

        /**
         *  Retrieves the users, but ordered by their last name.
         *  Sets the object variables isOrderedLastName and lastNameAsc (if it is set in ascending order)
         *  so that pagination keeps using that order.
         */
        orderByLastName: function (callback) {
            this.lastNameAsc = !this.lastNameAsc;
            var me = this,
                data = Liferay.Util.ns(
                this.get('portletNamespace'), {
                    cmd: 'list-users',
                    orderByCol: 'last-name',
                    delta: me.get('usersPerPage'),
                    curPage: me.currentPage,
                    isAsc: me.lastNameAsc
                });


            this.executeAjax({
                method: 'GET',
                data: data
            }, function (d) {
                d.isOrderedLastName = true;
                if (me.lastNameAsc) {
                    d.lastNameAsc = true;
                }

                me.renderTable(d);
            });
        },
        
        
        getGroupsPaginated: function (options) {
            var me = this;
            this.getGroups(Liferay.Util.ns(
                this.get('portletNamespace'), {
                    cmd: 'list-groups',
                    curPage: options.curPage,
                    delta: me.get('groupsPerPage')
            }));
        },
        
        getGroups: function (options, callback) {
            var me = this,
                data = (options) ? options : Liferay.Util.ns(
                this.get('portletNamespace'), {
                    cmd: 'list-groups',
                    delta: me.get('groupsPerPage')
                });
            this.executeAjax({
                method: 'GET',
                data: data
            }, function (groups) {
                if (typeof callback != 'undefined') {
                    callback(groups);
                }
                if (!options) {
                    if (me.groupsPaginator) {
                        me.groupsPaginator.set('total', Math.floor((groups.total + me.get('groupsPerPage') - 1) / me.get('groupsPerPage')));
                        me.groupsPaginator.set('page', 1);
                    }
                }
                me.renderGroupTable(groups);
            });
        },

        addGroup: function (groupName, groupList) {
            var me = this,
                data = Liferay.Util.ns(
                this.get('portletNamespace'), {
                    cmd: 'add-group',
                    'skype-group-name': groupName,
                    'ids': Y.JSON.stringify(groupList)
                });
            this.executeAjax({
                method: 'GET',
                data: data
            }, function (d) {
                me.getGroups();
            });
        },
        
        updateGroupName: function(groupId, groupName) {
            var me = this,
            data = Liferay.Util.ns(
            this.get('portletNamespace'), {
                cmd: 'update-group-name',
                'skype-group-id': groupId,
                'skype-group-name': groupName
            });
            this.executeAjax({
                method: 'GET',
                data: data
            }, function (d) {
                me.getGroups();
            });
        },
        
        updateGroup: function (groupId, groupName, groupList) {
            var me = this,
                data = Liferay.Util.ns(
                this.get('portletNamespace'), {
                    cmd: 'update-group',
                    'skype-group-id': groupId,
                    'skype-group-name': groupName,
                    'ids': Y.JSON.stringify(groupList)
                });
            this.executeAjax({
                method: 'GET',
                data: data
            }, function (d) {
                me.getGroups();
            });
        },

        removeGroup: function (groupId) {
            var me = this,
                data = Liferay.Util.ns(
                this.get('portletNamespace'), {
                    cmd: 'remove-group',
                    'skype-group-id': groupId
                });
            this.executeAjax({
                method: 'GET',
                data: data
            }, function (d) {
                me.getGroups();
            });
        }, 

        getGroupInfo: function (skypeGroupId, callback) {
            var data = Liferay.Util.ns(
            this.get('portletNamespace'), {
                cmd: 'get-group',
                'skype-group-id': skypeGroupId
            });
            this.executeAjax({
                method: 'GET',
                data: data
            }, function (d) {
                callback(d);
            });
        },

/** -------------------------------- RENDERING FUNCTIONS ---------------------------------/*

        /**
         * Renders the pagination using Handlebars' templating. 
         * 
         */
        renderPagination: function (total) {
            var source = Y.one('#' + this.pns + 'pagination-template').getHTML(),
                template = Y.Handlebars.compile(source),
                items = [],
                // Sets the number of items the paginator will have on the left
                itemsOnLeft = Math.floor(this.itemsOnPaginator / 2);
            currentPage = this.currentPage,
            // Sets the tentative first number on pagination
            first = currentPage - itemsOnLeft,
            // Sets the tentative last number on pagination
            maxPage = currentPage + itemsOnLeft,
            // Gets the maximum possible number for a page
            maxPages = Math.ceil(this.total / this.get('usersPerPage'));

            // If the first page is negative, add that difference to the last page
            if (first < 1) {
                maxPage += (--first * -1);
                first = 1;
            }

            // If the last page is bigger than the allowed maximum, add the difference
            // to the "previous" list
            if (maxPage >= (maxPages + 1)) {
                first = first - (maxPage - maxPages);
                maxPage = maxPages;
            }

            if (first < 1) {
                first = 1;
            }

            for (var i = first; i <= maxPage; i++) {
                var obj = {
                    number: i
                };

                if (i == this.currentPage) {
                    obj.isCurrent = true;
                }

                items.push(obj);

            }
            var html = template({
                items: items
            });

            Y.one('#' + this.pns + 'table-pagination').get("childNodes").remove();
            Y.one('#' + this.pns + 'table-pagination').append(html);

        },

        /**
         *
         * Renders the table
         */
        renderTable: function (data) {
            var source = Y.one('#' + this.pns + 'table-template').getHTML(),
                template = Y.Handlebars.compile(source),
                html = template(data);

            Y.one('#' + this.pns + 'users-table').get('childNodes').remove();
            Y.one('#' + this.pns + 'users-table').append(html);

        },

        /**
         *
         * Renders elements on the group list
         */
        renderLi: function (data) {
            if (this.isInList(data.skypeid)) {
                var source = Y.one('#' + this.pns + 'item-template').getHTML(),
                    template = Y.Handlebars.compile(source),
                    html = template(data);

                Y.one('#'+ this.pns + 'users').append(html);
            } else {
                this.showMessage(Liferay.Language.get('error'), Liferay.Language.get('error.message.alredy.in.list'));
            }
        },

        renderGroupTable: function (groups) {
            var me = this;
            var source = Y.one('#' + this.pns + 'groups-template').getHTML(),
                template = Y.Handlebars.compile(source),
                html = template(groups);

            Y.one('#' + this.pns + 'groups-list .groups-wrapper').get('childNodes').remove();
            Y.one('#' + this.pns + 'groups-list .groups-wrapper').append(html);
            
            if (!this.groupsPaginator) {
                this.groupsPaginator = new Y.Pagination({
                    boundingBox: '#' + this.pns + 'groups-list .groups-pagination',
                    total: Math.floor((groups.total + this.get('groupsPerPage') - 1) / this.get('groupsPerPage')),
                    page: 1,
                    after: {
                        changeRequest: function(event) {
                            me.getGroupsPaginated({curPage: event.state.page});
                        }
                    }
                }).render();
            }
        },

        updateGroupRender: function (paramData) {
            var data = paramData["group-info"],
                length = data.ids.length,
                me = this;
            Y.one('#' + this.pns + 'group-name span').set("text", data["skype-group-name"]);
            Y.one('#' + this.pns + 'group-name span').setAttribute("group-id", data["skype-group-id"]);
            Y.one('#' + this.pns + 'users').get("childNodes").remove();

            for (var i = 0; i < length; i++) {
                var item = data.ids[i];
                if (item["is-skype"]) {
                    item.type = "skype";
                    item.skypeid = item["skype-sn"];
                } else {
                    item.type = "phone";
                    item.skypeid = item["primary-phone"];
                }
                me.renderLi(data.ids[i]);
            }

        },

        /**
         *    Given an element (a node with a title), a name (a string containing the text to be added)
         *   and a type (whether skype or phone), adds a new element to the list of users to be called.
         *
         */


/** -------------------------------- LISTENERS ---------------------------------/*

        /**
        *   Adds the user of the currently clicked element to the list of
        *    users to call. Specific for skype icon
        *
        */
        setSkypeListener: function () {
            var me = this;
            Y.one('#' + this.pns + 'users-table').delegate('click', function (e) {
                Y.all(".skype-portlet .portlet-msg-error").setStyle("display", "none");
                var lastNameNode = e.currentTarget.get("parentNode").previous(),
                    lastname = lastNameNode.get("text"),
                    name = lastNameNode.previous().get("text");
                me.renderLi({
                    type: "skype",
                    "last-name": lastname,
                    "first-name": name,
                    skypeid: e.currentTarget.get("title"),
                    "user-id": e.currentTarget.getAttribute("user")
                });
            }, ".icon-skype");
        },

        /**
         *   Adds the user of the currently clicked element to the list of
         *    users to call. Specific for skype icon
         *
         */
        setPhoneListener: function () {
            var me = this;
            Y.one('#' + this.pns + 'users-table').delegate("click", function (e) {
                Y.all(".skype-portlet .portlet-msg-error").setStyle("display", "none");
                var lastNameNode = e.currentTarget.get("parentNode").previous().previous(),
                    lastname = lastNameNode.get("text"),
                    name = lastNameNode.previous().get("text");

                me.renderLi({
                    type: "phone",
                    "last-name": lastname,
                    "first-name": name,
                    skypeid: e.currentTarget.get("title"),
                    "user-id": e.currentTarget.getAttribute("user")
                });
            }, ".icon-phone");
        },

        /**
         *   Adds listener which removes element from the list when the handler is clicked
         */
        setHandlerListener: function () {
            Y.one(".skype-users-to-call").delegate('click', function () {
                this.ancestor('li').remove();
            }, '.handle');
        },

        /**
         *   Adds listener for all numbers on pagination. Sets current page to
         *   the number clicked, and calls the funtions which dies ther Ajax request
         */
        paginationListener: function () {
            var me = this;
            Y.one('#' + this.pns + 'table-pagination').delegate('click', function (e) {
                e.preventDefault();
                me.currentPage = parseInt(e.currentTarget.get("text"));
                me.listUsersCall();
            }, '.pagination-number');
        },

        setPreviousListener: function () {
            var me = this;
            Y.one('#' + this.pns + 'table-pagination').delegate("click", function (e) {
                e.preventDefault();
                if (me.currentPage > 1) {
                    me.currentPage -= 1;
                }
                me.listUsersCall();
            }, '#' + this.pns + 'pagination-previous');
        },

        setNextListener: function () {
            var me = this;
            Y.one('#' + this.pns + 'table-pagination').delegate("click", function (e) {
                e.preventDefault();
                var last = Math.ceil(me.total / me.get('usersPerPage'));
                if (me.currentPage < last) {
                    me.currentPage += 1;
                }
                me.listUsersCall();
            }, '#' + this.pns + 'pagination-nexts');
        },

        setFirstListener: function () {
            var me = this;
            Y.one('#' + this.pns + 'table-pagination').delegate("click", function (e) {
                e.preventDefault();
                me.currentPage = 1;
                me.listUsersCall();
            }, '#' + this.pns + 'pagination-first');
        },

        setLastListener: function () {
            var me = this;
            Y.one('#' + this.pns + 'table-pagination').delegate("click", function (e) {
                e.preventDefault();
                me.currentPage = Math.ceil(me.total / me.get('usersPerPage'));
                me.listUsersCall();
            }, '#' + this.pns + 'pagination-last');
        },

        sortNameListener: function () {
            var me = this;
            Y.one('#' + this.pns + 'users-table').delegate("click", function (e) {
                me.isOrderedName = true;
                me.isOrderedLastName = false;
                me.orderByName();
            }, '#' + this.pns + 'name');
        },

        sortLastNameListener: function () {
            var me = this;
            Y.one('#' + this.pns + 'users-table').delegate("click", function (e) {
                me.isOrderedLastName = true;
                me.isOrderedName = false;
                me.orderByLastName();
            }, '#' + this.pns + 'lastname');
        },

        /**
         *   Opens Skype and loads the usernames/phone numbers if any has been added.
         *
         */
        openSkypeListener: function () {
        	var me = this;
            var skypeBtn = Y.one('#' + this.pns + 'skype-open');
            var skypeClientFrameId = this.skypeHelper.generateDetectionFrame(skypeBtn.get('id'));
            skypeBtn.on("click", function () {
                var users = "",
                    items = Y.all('#' + me.pns + 'users li');

                if (items.size() != 0) {
                    Skype.tryAnalyzeSkypeUri('chat', '0');
                    Y.all('#' + me.pns + 'users li').each(function (li) {
                        users += li.getAttribute("skypeid") + ";";
                    });
                    me.skypeHelper.openSkypeURI(skypeClientFrameId, "skype:" + users + "?chat&topic=" + encodeURIComponent(Y.one('#' + me.pns + 'group-name span').get("text")));

                } else {
                    Y.all(".skype-portlet .portlet-msg-error").setStyle("display", "block");
                }
            });
        },

        /**
         *   Opens Skype and loads the usernames/phone numbers if any has been added.
         *
         */
        callSkypeListener: function () {
        	var me = this;
            var skypeBtn = Y.one('#' + this.pns + 'skype-call');
            var skypeClientFrameId = this.skypeHelper.generateDetectionFrame(skypeBtn.get('id'));
            skypeBtn.on("click", function () {
                var users = "",
                    items = Y.all('#' + me.pns + 'users li');

                if (items.size() != 0) {
                    Skype.tryAnalyzeSkypeUri('chat', '0');
                    Y.all('#' + me.pns + 'users li').each(function (li) {
                        users += li.getAttribute("skypeid") + ";";
                    });
                    me.skypeHelper.openSkypeURI(skypeClientFrameId, "skype:" + users + "?call");
                } else {
                    Y.all(".skype-portlet .portlet-msg-error").setStyle("display", "block");
                }
            });
        },
        
        
        /* Skype helper: generates detection iframe and opens skype */
        skypeHelper: {
            /* Generates detection iframe */
            generateDetectionFrame: function(buttonId) {
                Skype.createDetectionFrame(document.getElementById(buttonId));
                return Skype.detectSkypeClientFrameId;
            },
            /* Opens skype with the given uri */
            openSkypeURI: function(skypeClientFrameId, uri) {
                if (Skype.isIE10 || Skype.isIE9 || Skype.isIE8) {
                    Skype.trySkypeUri_IE9_IE8(uri, '', '');
                } else if ((Skype.isIOS6 || Skype.isIOS5 || Skype.isIOS4) && Skype.isSafari) {
                    Skype.trySkypeUri_IOS_Safari(uri, skypeClientFrameId, '');
                } else if (this.isAndroid && this.isFF) {
                    Skype.trySkypeUri_Android_Firefox(uri, skypeClientFrameId, '');
                } else {
                    Skype.trySkypeUri_Generic(uri, skypeClientFrameId, '');
                }
            }
        },
        
        saveGroupListener: function () {
            var me = this,
                id = Y.one('#' + this.pns + 'group-name span').getAttribute("group-id");
            Y.one('#' + this.pns + 'skype-save').on("click", function () {
                var users = [],
                    groupName = Y.one('#' + me.pns + 'group-name span').get("text");
                users = me.getUsers();
                id = Y.one('#' + me.pns + 'group-name span').getAttribute("group-id");
                if (users.length > 0) {
                    if (id == "") {
                        me.addGroup(groupName, users);
                    } else {
                        me.updateGroup(id, groupName, users);
                    }
                } else {
                    me.showMessage(Liferay.Language.get('error'), Liferay.Language.get('error.message.select.one.user.to.save'));
                }
                me.getGroups();
            });

        },

        loadGroupListener: function () {
            var me = this;
            
            Y.one('#' + this.pns + 'skype-load').on("click", function () {
                Y.one('#' + me.pns + 'groups-list').setStyle("display", "block");
                Y.one('#' + me.pns + 'group-save').setStyle("display", "none");
                me.getGroups(null, function(groups) {
                    if (me.groupsPaginator) {
                        me.groupsPaginator.set('total', Math.floor((groups.total + me.get('groupsPerPage') - 1) / me.get('groupsPerPage')));
                        me.groupsPaginator.set('page', 1);
                    }
                });
            });
        },

        groupInfoListener: function () {
            var me = this;
            Y.one('#' + this.pns + 'groups-list').delegate("click", function (e) {
                me.getGroupInfo(e.currentTarget.getAttribute("group-id"),
                // using bind to keep the function context to "me"
                Y.bind(me.updateGroupRender, me));

                Y.one('#' + me.pns + 'groups-list').setStyle("display", "none");
            }, ".icon-folder-open");
        },

        groupLisListener: function () {
            Y.one('#' + this.pns + 'groups-list').delegate("hover", function (e) {
                e.currentTarget.one(".group-options").addClass('show');
            }, function (e) {
                e.currentTarget.one(".group-options").removeClass('show');
            }, '#' + this.pns + 'groups > li');
        },

        iconEditListener: function () {
            Y.one('#' + this.pns + 'groups-list').delegate("click", function (e) {
                e.currentTarget.ancestor(".group-options").next().setStyle("display", "block");
                var li = e.currentTarget.ancestor("li"),
                    span = li.one("span"),
                    spanText = span.get("text"),
                    input = li.one("input[type=text]");
                li.addClass('editing');
                input.set("value", spanText);
                span.setStyle("display", "none");
            }, '#' + this.pns + 'groups .icon-pencil');
        },

        iconSaveEditGroupListener: function () {
            Y.one('#' + this.pns + 'groups-list').delegate("click", function (e) {
                e.currentTarget.ancestor(".edit-group").setStyle("display", "none");
                var li = e.currentTarget.ancestor("li"),
                    span = li.one("span"),
                    input = li.one("input[type=text]");
                li.removeClass('editing');
                input.set("value", "");
                span.setStyle("display", "block");
            }, '#' + this.pns + 'groups .cancel-edit-group');

        },

        iconEditName: function () {
            Y.one('#' + this.pns + 'group-name').delegate("click", function (e) {
                var h3 = e.currentTarget.ancestor("h3"),
                    span = h3.one("span"),
                    spanText = span.get("text"),
                    edit = h3.next().setStyle("display", "block");
                input = edit.one('input');

                input.set("value", spanText);
                h3.setStyle("display", "none");
            }, "i");
        },

        iconCancelName: function () {
        	 var me = this;
            Y.one("div.skype-users-to-call").delegate("click", function (e) {
                var h3 = Y.one('#' + me.pns + 'group-name'),
                    span = h3.one("span"),
                    spanText = span.get("text"),
                    edit = h3.next().setStyle("display", "none");
                input = edit.one('input');
                input.set("value", spanText);
                h3.setStyle("display", "block");
            }, ".edit-group .cancel-edit-group");
        },

        iconSaveName: function () {
            var me = this;
            Y.one("div.skype-users-to-call").delegate("click", function (e) {
                var h3 = Y.one('#' + me.pns + 'group-name'),
                span = h3.one("span");
                
                /* if user is editing name from groups list */
                if (e.currentTarget.hasClass('list-item')) {
                    var groupNode = e.currentTarget.ancestor('li');
                    var groupId = groupNode.one('.icon-folder-open').getAttribute('group-id');
                    var groupName = groupNode.one('input[type="text"]').get('value');
                    if (span.getAttribute("group-id") == groupId) {
                        span.set("text", groupName);
                    }
                    me.updateGroupName(groupId, groupName);
                } else {
                    var edit = h3.next().setStyle("display", "none");
                    input = edit.one('input'), id = span.getAttribute("group-id");
    
                    span.set("text", input.val());
                    h3.setStyle("display", "block");
    
                    if (id != "") {
                        var users = me.getUsers();
                        if (users.length > 0) {
                            me.updateGroup(id, input.val(), users);
                        } else {
                            me.showMessage(Liferay.Language.get('error'), Liferay.Language.get('error.message.select.one.user.to.save'));
                        }
                    }
                }
                
            }, ".edit-group .save-edit-group");
        },

        iconDeleteGroup: function () {
            var me = this;
            Y.one('#' + this.pns + 'groups-list').delegate("click", function (e) {
                var id = e.currentTarget.ancestor('.group-options').one('.icon-folder-open');
                id = id.getAttribute("group-id");
                if (id != "") {
                    var confirm = window.confirm(Liferay.Language.get("message.delete.group"));
                    if (confirm) {
                        me.removeGroup(id);
                    }
                }
            }, ".icon-remove");
        },

/** -------------------------------- MISCELLANEOUS ---------------------------------/*

        /**
        *   Checks whether a user is already in the list of users to call
        *
        */
        isInList: function (personId) {
            var users = "";
            Y.all(".skype-users-to-call li").each(function (li) {
                users += li.getAttribute("skypeid") + ";";
            });
            return users.indexOf(personId) == -1;
        },
        getUsers: function () {
            var users = [],
                userid, isSkype, cssClass;
            Y.all('#' + this.pns + 'users li').each(function (element) {
                userid = element.getAttribute("user");
                cssClass = element.getAttribute("class");

                isSkype = (cssClass.indexOf("skype") != -1);
                users.push({
                    'user-id': userid,
                    'is-skype': isSkype
                });

            });
            return users;
        },

        showMessage: function (title, message) {
            new Y.Modal({
                bodyContent: '<p>' + message + '</p>',
                centered: true,
                headerContent: '<h2>' + title + '</h2>',
                render: '#' + this.pns + 'modal',
                height: 250,
                modal: true
            }).render();
        },

        /**
         * List
         *
         */
        initializer: function () {
        	this.pns = this.get('portletNamespace');	
            this.listUsersCall();
            this.setSkypeListener();
            this.setPhoneListener();
            this.setPreviousListener();
            this.sortNameListener();
            this.sortLastNameListener();
            this.paginationListener();
            this.setNextListener();
            this.setFirstListener();
            this.setLastListener();
            this.setHandlerListener();
            this.openSkypeListener();
            this.callSkypeListener();
            this.saveGroupListener();

            this.loadGroupListener();
            this.groupInfoListener();


            this.groupLisListener();
            this.iconEditListener();
            this.iconSaveEditGroupListener();
            this.iconDeleteGroup();
            this.iconEditName();
            this.iconCancelName();
            this.iconSaveName();
        }
    }, {
        ATTRS: {

            portletNamespace: {
                value: ''
            },

            container: {
                value: null
            },

            resourceUrl: {
                value: ''
            },

            isMobile: {
                value: false
            },

            usersPerPage: {
                value: 10
            },

            groupsPerPage: {
                value: 5
            }

        }
    })
}, '@VERSION@', {
    "requires": ["yui-base", "base-build", "node", "event", 'node', 'event', 'aui-datatable', 'aui-pagination', 'aui-modal', 'aui-tooltip', 'handlebars', 'json-parse', 'io-base', 'aui-io-request']
});