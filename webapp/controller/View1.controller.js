sap.ui.define([
	'jquery.sap.global',
	"sap/ui/core/mvc/Controller",
	'sap/m/MessageBox',
	'sap/m/Dialog',
	'sap/m/Text',
	'sap/m/Button',
	"sap/ndc/BarcodeScanner",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(jquery, Controller, MessageBox, Dialog, Text, Button,BarcodeScanner, Filter, FilterOperator) {
	"use strict";
	var mainInstance;
	var mousePressed = false;
	var lastX, lastY;
	var ctx;
	var cPushArray = new Array();
	var cStep = -1;
	var color;
	var canvas;
	return Controller.extend("CameraUploadFuntionCameraUploadFuntion.controller.View1", {

		onInit: function() {
			this.fnSetTableData();
			this.byId("selWidth").setVisible(false);
			this.byId("selColor").setVisible(false);
			this.byId("input-box").setVisible(false);
			this.byId("btnSave").setEnabled(false);
			this.byId("btnReset").setEnabled(false);
			//Hide camera button if app open in desktop
			var deviceModel = new sap.ui.model.json.JSONModel({
				isPhone: sap.ui.Device.system.phone,
				isNoPhone: !sap.ui.Device.system.phone,
			});
			deviceModel.setDefaultBindingMode("OneWay");
			var odev = deviceModel.getData().isPhone;
			if (odev === true) {
				this.byId("openCamera").setVisible(true);
			} else {
				this.byId("openCamera").setVisible(false);
			}

			mainInstance = this;
			mainInstance.fileJson = [];

//Process Flow Data Set
			var oView = this.getView();
			  this.oProcessFlow2 = oView.byId("processflow2");  
			   var sDataPath = sap.ui.require.toUrl("CameraUploadFuntionCameraUploadFuntion/model/ProcessFlowLanesOnly.json");
			  var oModelPf2 =  new sap.ui.model.json.JSONModel(sDataPath);
			  oView.setModel(oModelPf2, "pf2");
				},

		onAfterRendering: function() {
			var map = this.getView().byId("Photo");
			 canvas = new sap.ui.core.HTML({
				content: "<div align='left' >" +
					"<canvas press='onClickImage' id='myCanvas' width='300' height='300' style='border:1px solid #000000;'></div>"
			});
			map.addContent(canvas);
			var hmap = document.getElementById('myCanvas');
		},

		//Photo select by local file
		onImageUpload: function(oEvent) {
			this.getView().byId("_IDGenObjectPageSection1").setVisible(true);
			var oCont = this;
			var imageSizeInBytes = oEvent.mParameters.files[0].size;
			var totalSizeKB = imageSizeInBytes / Math.pow(1024, 1);
			if (totalSizeKB > 2048) {
				var dialog = new Dialog({
					title: 'Warning',
					type: 'Message',
					state: 'Warning',
					content: new Text({
						text: 'Image size not more then 2MB..!'
					}),
					beginButton: new Button({
						text: 'OK',
						press: function() {
							dialog.close();
						}
					}),
					afterClose: function() {
						dialog.destroy();
					}
				});
				dialog.open();
			} else {
				ctx = document.getElementById('myCanvas').getContext("2d");
				this.evtId = oEvent.getSource().getId();
				if (mainInstance.fileJson.length >= 0) {
					mainInstance.fileJson = [];
				}
				this.fileItems = [];
				this.fileContent = [];
				var itemObj = {
					FileName: "",
					oFile: "",
					base64: "",
					FileType: "",
					size: "",
					zEnrolType: "",
					FG: ""
				};
				this.fileItems = oEvent.mParameters.files;
				for (var i = 0; i < this.fileItems.length; i++) {
					if (this.fileItems[i]) {
						itemObj = {
							FileName: this.fileItems[i].name,
							oFile: this.fileItems[i],
							base64: "",
							FileType: this.fileItems[i].type,
							size: this.fileItems[i].size,
							FG: "X"
						};
						mainInstance.fileJson.push(itemObj);
						var totFiles = this.fileJson.length;
						var max = this.fileItems.length;
						var index = totFiles - this.fileItems.length;
						if (mainInstance.fileJson[totFiles - 1].oFile) {
							var reader = new FileReader();
							var BASE64_MARKER = 'data:' + this.fileJson[totFiles - 1].oFile.type + ';base64,';
							reader.onload = (function(evt) {
								return function(evt) {
									var base64Index = evt.target.result.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
									var base64 = evt.target.result.substring(base64Index);
									if (index < totFiles) {
										mainInstance.fileJson[index].base64 = base64;
										index++;
									}

									ctx = document.getElementById('myCanvas').getContext("2d");
									var FileContent1 = (base64);
									var image = new Image();
									image.src = "data:image/jpeg;base64," + FileContent1;
									image.onload = function() {
										ctx.drawImage(image, 0, 50, 300, 250);
									};
									document.getElementById("myCanvas").addEventListener("click", function(e) {
										oCont.onClickImage(e);
									}, false);
										oCont.getView().byId("selColor").setVisible(true);
									oCont.getView().byId("selWidth").setVisible(true);
									oCont.getView().byId("input-box").setVisible(true);
									oCont.getView().byId("btnSave").setEnabled(true);
									oCont.getView().byId("btnReset").setEnabled(true);

								}
							})(this.fileJson[totFiles - 1].oFile);
							reader.readAsDataURL(mainInstance.fileJson[totFiles - 1].oFile);
							mainInstance.imgData64 = mainInstance.fileJson[totFiles - 1].base64;
							mainInstance.FileType = mainInstance.fileJson[totFiles - 1].FileType;

						}
					}
				}
			}

		},

		//photo capture by mobile camera
		onCaptureImage: function(oEvent) {
			var oCont = this;
			navigator.camera.getPicture(captureSuccess, captureError, {
				quality: 100,
				targetWidth: 300,
				targetHeight: 300,
				allowEdit: true,
				correctOrientation: true,
				sourceType: navigator.camera.PictureSourceType.CAMERA,
				destinationType: Camera.DestinationType.DATA_URL
			});

			function captureSuccess(imageData) {
				var decoded = atob(imageData);
				var inbyte = decoded.length;
				var inKb = inbyte / Math.pow(1024, 1);
				if (inKb > 2048) {
					var dialog = new Dialog({
						title: 'Warning',
						type: 'Message',
						state: 'Warning',
						content: new Text({
							text: 'Image size not more then 2MB..!'
						}),
						beginButton: new Button({
							text: 'OK',
							press: function() {
								dialog.close();
							}
						}),
						afterClose: function() {
							dialog.destroy();
						}
					});
					dialog.open();
				} else {
					ctx = document.getElementById('myCanvas').getContext("2d");
					var FileContent1 = (imageData);
					var image = new Image();
					image.src = "data:image/jpeg;base64," + FileContent1;
					image.onload = function() {
						ctx.drawImage(image, 0, 50, 300, 250);
					};
					document.getElementById("myCanvas").addEventListener("click", function(e) {
						oCont.onClickImage(e);
					}, false);
					oCont.getView().byId("selColor").setVisible(true);
					oCont.getView().byId("selWidth").setVisible(true);
					oCont.getView().byId("input-box").setVisible(true);
					oCont.getView().byId("btnSave").setEnabled(true);
					oCont.getView().byId("btnReset").setEnabled(true);
				}
			}

			function captureError(message) {
				
			}

		},
		//Photo capture by laptop camera
		onCaptureImageL: function(oEvent) {
			var that = this;
			this.cameraDialog = new Dialog({
				title: "Click on capture to take a photo",
				beginButton: new sap.m.Button({
					text: "capture",
					press: function(oEvent) {
						that.imageValue = document.getElementById("player");
						that.cameraDialog.close();
					}
				}),
				content: [new sap.ui.core.HTML({
						content: "<video id='player' autoplay></video>"
					})],
				endButton: new Button({
					tetx: "Cancel",
					press: function() {
						that.cameraDialog.close();
					}
				})
			});
			that.getView().addDependent(that.cameraDialog);
			//launh the popup
			that.cameraDialog.open();
			that.cameraDialog.attachBeforeClose(that.setImage, that);
			//set image is the function where we set the live image in the canvas to the user;
			var handleSuccess = function(stream) {
			player.srcObject = stream;
				
			};
			//API to start our camera;
			navigator.mediaDevices.getUserMedia({
				video: true
			}).then(handleSuccess);

		},

		setImage: function() {
			//take the running live image ffrom the vide stremof camera
			var pId = this.getView().byId("Photo");
			var oCont = this;
			var imageValue = this.imageValue;
			if (imageValue === null) {
				sap.m.MessageToast.show("No Image Capture");
			} else {
			
				pId.addContent(canvas);
				 canvas.addEventDelegate({
					onAfterRendering: function() {
						ctx = document.getElementById('myCanvas').getContext("2d");
						ctx.drawImage(imageValue, 0, 50, 300, 250);
						
						player.srcObject.getVideoTracks()[0].stop();
						document.getElementById("myCanvas").addEventListener("click", function(e) {
							oCont.onClickImage(e);
						}, false);
						oCont.getView().byId("selColor").setVisible(true);
						oCont.getView().byId("selWidth").setVisible(true);
						oCont.getView().byId("input-box").setVisible(true);
						oCont.getView().byId("btnSave").setEnabled(true);
						oCont.getView().byId("btnReset").setEnabled(true);	
						
					}
				});
			}
		},
		//draw on image
		onClickImage: function(e) {
			// set device model
			var deviceModel = new sap.ui.model.json.JSONModel({
				isPhone: sap.ui.Device.system.phone,
				isNoPhone: !sap.ui.Device.system.phone,
			});
			deviceModel.setDefaultBindingMode("OneWay");
			var odev = deviceModel.getData().isPhone;
			if (odev === true) {
				var canvas = document.getElementById("myCanvas");
				var drawing = false;
				var mousePos = {
					x: 0,
					y: 0
				};
				var lastPos = mousePos;
				var that = this;
				canvas.addEventListener("touchstart", function(e) {
					if (e.target == canvas) {
						e.preventDefault();
					}
					mousePressed = true;
					that.drawCircle(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
				}, false);

				canvas.addEventListener("touchend", function(e) {
					if (e.target == canvas) {
						e.preventDefault();
					}
					var mouseEvent = new MouseEvent("mouseup", {});
					canvas.dispatchEvent(mouseEvent);
				}, false);

				canvas.addEventListener("touchmove", function(e) {
					if (e.target == canvas) {
						e.preventDefault();
					}
					var touch = e.touches[0];
					var mouseEvent = new MouseEvent("mousemove", {
						clientX: touch.clientX,
						clientY: touch.clientY
					});
					canvas.dispatchEvent(mouseEvent);
					if (mousePressed) {
						that.drawCircle(mouseEvent.clientX - $(this).offset().left, mouseEvent.clientY - $(this).offset().top, true);
					}

				}, false);
			} else {
				var that = this;
				$('#myCanvas').mousedown(function(e) {
					mousePressed = true;
					that.drawCircle(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false);
				});

				$('#myCanvas').mousemove(function(e) {
					if (mousePressed) {
						e.preventDefault();
						that.drawCircle(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true);
					}
				});

				$('#myCanvas').mouseup(function(e) {
					mousePressed = false;
				});

				$('#myCanvas').mouseleave(function(e) {
					mousePressed = false;
				});
			}
		},
		getMousePos: function(canvasDom, mouseEvent) {
			var rect = canvasDom.getBoundingClientRect();
			return {
				x: mouseEvent.clientX - rect.left,
				y: mouseEvent.clientY - rect.top
			};
		},

		drawCircle: function(x, y, isDown) {
			if (isDown) {
				ctx.beginPath();
				ctx.strokeStyle = color;
				//ctx.strokeStyle = (this.getView().byId("selColor").getSelectedItem().getText());
				ctx.lineWidth = (this.getView().byId("selWidth").getSelectedItem().getText());
				if (ctx.lineWidth == "0") {
					ctx.lineWidth = "1"
				} else {
					ctx.lineWidth = (this.getView().byId("selWidth").getSelectedItem().getText());
				}
				ctx.lineJoin = "round";
				ctx.moveTo(lastX, lastY);
				ctx.lineTo(x, y);
				ctx.closePath();
				ctx.stroke();

			}
			lastX = x;
			lastY = y;

		},

		cUndo: function() {
			if (cStep > 0) {
				cStep--;
				var canvasPic = new Image();
				canvasPic.src = cPushArray[cStep];
				canvasPic.onload = function() {
					ctx.drawImage(canvasPic, 0, 0);
				}
			}
		},

		cRedo: function() {
			if (cStep < cPushArray.length - 1) {
				cStep++;
				var canvasPic = new Image();
				canvasPic.src = cPushArray[cStep];
				canvasPic.onload = function() {
					ctx.drawImage(canvasPic, 0, 0);
				}
			}
		},
		clearArea: function() {
			this.getView().byId("selColor").setVisible(false);
			this.getView().byId("selWidth").setVisible(false);
			this.getView().byId("input-box").setVisible(false);
			this.getView().byId("btnSave").setEnabled(false);
			this.getView().byId("btnReset").setEnabled(false);
			// Use the identity matrix while clearing the canvas
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		},
		drawOnCanvas: function(event) {
			//var el = document.getElementById("input-box");
			ctx.fillStyle = "#F4F4F4";
			//  ctx.fillRect(0, 0, 100, 100)
			ctx.fillStyle = "#FF0000";
			ctx.font = "30px Arial";
			$('input').keydown(function(e) {
				if (e.keyCode == 8) {
					var newvalue = $(this).val();
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.fillText(newvalue, 150, 100);
				}
			});
			$('input').keyup(function() {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.fillText($(this).val(), 150, 100);
			});
		},

		updateSketch: function() {
			// do cool things with the ctx
			ctx.font = '20pt Calibri';
			ctx.fillStyle = 'orange';
			ctx.clearRect(0, 0, ctx.canvas.width, 50);
			ctx.fillText(this.getView().byId("input-box").getValue(), 20, 40);
		},
		onExit: function() {
			// Destroy popovers if any

			if (this.oColorPalettePopoverFull) {
				this.oColorPalettePopoverFull.destroy();
			}
		},

		openFullSample: function(oEvent) {
			if (!this.oColorPalettePopoverFull) {
				this.oColorPalettePopoverFull = new sap.m.ColorPalettePopover("oColorPalettePopoverFull", {
					defaultColor: "black",
					colorSelect: this.handleColorSelect
				});
			}

			this.oColorPalettePopoverFull.openBy(oEvent.getSource());
		},

		handleColorSelect: function(oEvent) {
			color = oEvent.getParameter("value");
		},


		//Barcode Scanner
		onScanSuccess: function(oEvent) {
			if (oEvent.getParameter("cancelled")) {
				MessageToast.show("Scan cancelled", { duration:1000 });
			} else {
				if (oEvent.getParameter("text")) {
					oScanResultText.setText(oEvent.getParameter("text"));
				} else {
					oScanResultText.setText('');
				}
			}
		},

		onScanError: function(oEvent) {
			MessageToast.show("Scan failed: " + oEvent, { duration:1000 });
		},

		onScanLiveupdate: function(oEvent) {
			// User can implement the validation about inputting value
		},
		//ui and m Table Dynamic Creation
		fnSetTableData:function(){
			var aCurrentPriceTableData = [{
                "Plant": "1118", "Vendor1": "649", "Vendor2": "", "Vendor3": "", "Vendor4": "698.65", "Vendor5": "", "NLC": "668.86", "L1": "649" ,"L2" :"10001", "VendorX": "", "VendorY": "698.65", "VendorZ": ""
            }, {
                "Plant": "1301", "Vendor1": "", "Vendor2": "609", "Vendor3": "621", "Vendor4": "", "Vendor5": "626", "NLC": "613.07", "L1": "609"
            }, {
                "Plant": "Company", "Vendor1": "649", "Vendor2": "609", "Vendor3": "621", "Vendor4": "699", "Vendor5": "0", "NLC": "629", "L1": "621"
            }, {
                "Plant": "1118 post payment term adjustment", "Vendor1": "649", "Vendor2": "", "Vendor3": "690", "Vendor4": "", "Vendor5": "", "NLC": "", "L1": ""
            }, {
                "Plant": "Base Price", "Vendor1": "650", "Vendor2": "", "Vendor3": "700", "Vendor4": "", "Vendor5": "", "NLC": "", "L1": ""
            }];
            var oModel = new sap.ui.model.json.JSONModel(aCurrentPriceTableData);
            oModel.setDefaultBindingMode(sap.ui.model.BindingMode.TwoWay);
            this.getView().setModel(oModel, "CurrentPriceModel");
            var tData = this.getView().getModel("CurrentPriceModel").getData();
            var lData = Object.keys(this.getView().getModel("CurrentPriceModel").getData()[0]);
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
                rows: tData,
                columns: lData
            });
            //Successfully able to create columns
            var oTable2 = this.getView().byId("idMyTable");
            oTable2.setModel(oModel);
            for (var i = 0; i < lData.length; i++) {
                var oColumn = new sap.m.Column("col" + i, {
                    minScreenWidth:'Tablet',
                    demandPopin:true,
                    header: new sap.m.Label({
                        text:lData[i]
                    })
                });
                oTable2.addColumn(oColumn);
            }

            //How to add my table data?
            var oCell = [];
            for (var c = 0; c < tData.length; c++) {
                var plant=tData[c].Plant

             oCell = lData.map(function(plant) {
                    return new sap.m.Text({
                      text: '{' + plant + '}'
                    });
                  });
                //oCell.push(cell1,cell2);
            }
            var aColList = new sap.m.ColumnListItem("aColList", {
                cells: oCell
            });
            oTable2.bindItems("/rows", aColList);



            //Ui Table Dynamic Binding


            var columnData = [{
                columnName: "firstName"
            }, {
                columnName: "lastName"
            }, {
                columnName: "department"
            }];



            var rowData = [{
                firstName: "Sachin",
                lastName: "Tendulkar",
                department: "Cricket"
            }, {
                firstName: "Lionel",
                lastName: "Messi",
                department: "Football"
            }, {
                firstName: "Mohan",
                lastName: "Lal",
                department: "Film"
            }];

            var oTable = this.getView().byId("uiTable");


            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData({
                rows: rowData,
                columns: columnData
            });
            oTable.setModel(oModel);

            oTable.bindColumns("/columns", function(sId, oContext) {
                var columnName = oContext.getObject().columnName;
                return new sap.ui.table.Column({
                    label: columnName,
                    template: columnName,
                });
            });

            oTable.bindRows("/rows");
		}

	});
});