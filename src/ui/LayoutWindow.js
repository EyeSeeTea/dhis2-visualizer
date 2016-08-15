import isString from 'd2-utilizr/lib/isString';
import isArray from 'd2-utilizr/lib/isArray';
import arrayContains from 'd2-utilizr/lib/arrayContains';
import arrayPluck from 'd2-utilizr/lib/arrayContains';
import clone from 'd2-utilizr/lib/clone';

export var LayoutWindow;

LayoutWindow = function(c) {
    var t = this,

        uiManager = c.uiManager,
        instanceManager = c.instanceManager,
        i18n = c.i18nManager.get(),
        dimensionConfig = c.dimensionConfig,

        confData = dimensionConfig.get('data'),
        confPeriod = dimensionConfig.get('period'),
        confOrganisationUnit = dimensionConfig.get('organisationUnit'),
        confCategory = dimensionConfig.get('category'),

        dimensionStoreMap = {},
        margin = 1,
        defaultWidth = 200,
        defaultHeight = 220;

    // components

    var getStore = function(data) {
			var config = {};

			config.fields = ['id', 'name'];

			if (data) {
				config.data = data;
			}

			config.getDimensionNames = function() {
				var dimensionNames = [];

				this.each(function(r) {
					dimensionNames.push(r.data.id);
				});

				return clone(dimensionNames);
			};

            config.hasDimension = function(id) {
                return isString(id) && this.findExact('id', id) != -1 ? true : false;
            };

            config.removeDimension = function(id) {
                var index = this.findExact('id', id);

                if (index != -1) {
                    this.remove(this.getAt(index));
                }
            };

			return Ext.create('Ext.data.Store', config);
		};

    var getStoreKeys = function(store) {
        var keys = [],
            items = store.data.items;

        if (items) {
            for (var i = 0; i < items.length; i++) {
                keys.push(items[i].data.id);
            }
        }

        return keys;
    };

    var dimensionStore = getStore();

    var colStore = getStore();

    var rowStore = getStore();

    var filterStore = getStore();

    var dimension = Ext.create('Ext.ux.form.MultiSelect', {
        cls: 'ns-toolbar-multiselect-leftright',
        width: defaultWidth - 50,
        height: (defaultHeight * 2) + margin,
        style: 'margin-right:' + margin + 'px; margin-bottom:0px',
        valueField: 'id',
        displayField: 'name',
        dragGroup: 'layoutDD',
        dropGroup: 'layoutDD',
        ddReorder: false,
        store: dimensionStore,
        tbar: {
            height: 25,
            items: {
                xtype: 'label',
                text: NS.i18n.excluded_dimensions,
                cls: 'ns-toolbar-multiselect-leftright-label'
            }
        },
        listeners: {
            afterrender: function(ms) {
                ms.store.on('add', function() {
                    Ext.defer( function() {
                        ms.boundList.getSelectionModel().deselectAll();
                    }, 10);
                });
            }
        }
    });

    var col = Ext.create('Ext.ux.form.MultiSelect', {
        cls: 'ns-toolbar-multiselect-leftright',
        width: defaultWidth,
        height: defaultHeight,
        style: 'margin-bottom:' + margin + 'px',
        valueField: 'id',
        displayField: 'name',
        dragGroup: 'layoutDD',
        dropGroup: 'layoutDD',
        store: colStore,
        tbar: {
            height: 25,
            items: {
                xtype: 'label',
                text: NS.i18n.series_dimensions,
                cls: 'ns-toolbar-multiselect-leftright-label'
            }
        },
        listeners: {
            afterrender: function(ms) {
                ms.boundList.on('itemdblclick', function(view, record) {
                    ms.store.remove(record);
                    dimensionStore.add(record);
                });

                ms.store.on('add', function(store, addedRecords) {
                    var range = store.getRange();

                    if (range.length > 1) {
                        var addedIds = arrayPluck(addedRecords, 'internalId'),
                            records = clone(range);

                        store.removeAll();

                        for (var i = 0; i < range.length; i++) {
                            if (arrayContains(addedIds, range[i].internalId)) {
                                store.add(range[i]);
                            }
                            else {
                                filterStore.add(range[i]);
                            }
                        }
                    }

                    Ext.defer( function() {
                        ms.boundList.getSelectionModel().deselectAll();
                    }, 10);
                });
            }
        }
    });

    var row = Ext.create('Ext.ux.form.MultiSelect', {
        cls: 'ns-toolbar-multiselect-leftright',
        width: defaultWidth,
        height: defaultHeight,
        style: 'margin-bottom:0px',
        valueField: 'id',
        displayField: 'name',
        dragGroup: 'layoutDD',
        dropGroup: 'layoutDD',
        store: rowStore,
        tbar: {
            height: 25,
            items: {
                xtype: 'label',
                text: NS.i18n.category_dimensions,
                cls: 'ns-toolbar-multiselect-leftright-label'
            }
        },
        listeners: {
            afterrender: function(ms) {
                ms.boundList.on('itemdblclick', function(view, record) {
                    ms.store.remove(record);
                    dimensionStore.add(record);
                });

                ms.store.on('add', function(store, addedRecords) {
                    var range = store.getRange();

                    if (range.length > 1) {
                        var addedIds = Ext.Array.pluck(addedRecords, 'internalId'),
                            records = clone(range);

                        store.removeAll();

                        for (var i = 0; i < range.length; i++) {
                            if (Ext.Array.contains(addedIds, range[i].internalId)) {
                                store.add(range[i]);
                            }
                            else {
                                filterStore.add(range[i]);
                            }
                        }
                    }

                    Ext.defer( function() {
                        ms.boundList.getSelectionModel().deselectAll();
                    }, 10);
                });
            }
        }
    });

    var filter = Ext.create('Ext.ux.form.MultiSelect', {
        cls: 'ns-toolbar-multiselect-leftright',
        width: defaultWidth,
        height: defaultHeight,
        style: 'margin-right:' + margin + 'px; margin-bottom:' + margin + 'px',
        valueField: 'id',
        displayField: 'name',
        dragGroup: 'layoutDD',
        dropGroup: 'layoutDD',
        store: filterStore,
        tbar: {
            height: 25,
            items: {
                xtype: 'label',
                text: NS.i18n.report_filter,
                cls: 'ns-toolbar-multiselect-leftright-label'
            }
        },
        listeners: {
            afterrender: function(ms) {
                ms.boundList.on('itemdblclick', function(view, record) {
                    ms.store.remove(record);
                    dimensionStore.add(record);
                });

                ms.store.on('add', function() {
                    Ext.defer( function() {
                        ms.boundList.getSelectionModel().deselectAll();
                    }, 10);
                });
            }
        }
    });

    var selectPanel = Ext.create('Ext.panel.Panel', {
        bodyStyle: 'border:0 none',
        items: [
            {
                layout: 'column',
                bodyStyle: 'border:0 none',
                items: [
                    filter,
                    col
                ]
            },
            {
                layout: 'column',
                bodyStyle: 'border:0 none',
                items: [
                    row
                ]
            }
        ]
    });

    var addDimension = function(record, store) {
        var store = dimensionStoreMap[record.id] || store || colStore;

        if (!hasDimension(record.id)) {
            store.add(record);
        }
    };

    var removeDimension = function(dataElementId) {
        var stores = [colStore, rowStore, filterStore, dimensionStore];

        for (var i = 0, store, index; i < stores.length; i++) {
            store = stores[i];

            if (store.hasDimension(dataElementId)) {
                store.removeDimension(dataElementId);
                dimensionStoreMap[dataElementId] = store;
            }
        }
    };

    var hasDimension = function(id) {
        var stores = [colStore, rowStore, filterStore, dimensionStore];

        for (var i = 0, store, index; i < stores.length; i++) {
            if (stores[i].hasDimension(id)) {
                return true;
            }
        }

        return false;
    };

    var saveState = function(map) {
        map = map || dimensionStoreMap;

        colStore.each(function(record) {
            map[record.data.id] = colStore;
        });

        rowStore.each(function(record) {
            map[record.data.id] = rowStore;
        });

        filterStore.each(function(record) {
            map[record.data.id] = filterStore;
        });

        return map;
    };

    var resetData = function() {
        var map = saveState({}),
            keys = ['dx', 'ou', 'pe', 'dates'];

        for (var key in map) {
            if (map.hasOwnProperty(key) && !Ext.Array.contains(keys, key)) {
                removeDimension(key);
            }
        }
    };

    var reset = function(isAll) {
        colStore.removeAll();
        rowStore.removeAll();
        filterStore.removeAll();
        dimensionStore.removeAll();

        if (!isAll) {
            colStore.add({id: dimConf.data.dimensionName, name: dimConf.data.name});
            rowStore.add({id: dimConf.period.dimensionName, name: dimConf.period.name});
            filterStore.add({id: dimConf.organisationUnit.dimensionName, name: dimConf.organisationUnit.name});
            dimensionStore.add({id: dimConf.category.dimensionName, name: dimConf.category.name});
        }
    };

    var getSetup = function() {
        return {
            col: getStoreKeys(colStore),
            row: getStoreKeys(rowStore),
            filter: getStoreKeys(filterStore)
        };
    };

    var window = Ext.create('Ext.window.Window', {
        title: NS.i18n.chart_layout,
        bodyStyle: 'background-color:#fff; padding:' + margin + 'px',
        closeAction: 'hide',
        autoShow: true,
        modal: true,
        resizable: false,
        getSetup: getSetup,
        dimensionStore: dimensionStore,
        rowStore: rowStore,
        colStore: colStore,
        filterStore: filterStore,
        addDimension: addDimension,
        removeDimension: removeDimension,
        hasDimension: hasDimension,
        hideOnBlur: true,
        items: {
            layout: 'column',
            bodyStyle: 'border:0 none',
            items: [
                dimension,
                selectPanel
            ]
        },
        bbar: [
            '->',
            {
                text: NS.i18n.hide,
                listeners: {
                    added: function(b) {
                        b.on('click', function() {
                            window.hide();
                        });
                    }
                }
            },
            {
                text: '<b>' + NS.i18n.update + '</b>',
                listeners: {
                    added: function(b) {
                        b.on('click', function() {
                            instanceManager.getReport();

                            window.hide();
                        });
                    }
                }
            }
        ],
        listeners: {
            show: function(w) {
                var layoutButton = uiManager.get('layoutButton') || {};

                if (layoutButton.rendered) {
                    c.uiManager.setAnchorPosition(w, layoutButton);

                    if (!w.hasHideOnBlurHandler) {
                        c.uiManager.addHideOnBlurHandler(w);
                    }
                }
            },
            render: function() {
                reset();
            }
        }
    });

    return window;
};
