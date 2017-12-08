 var Shortcutswidget = Shortcutswidget || {
	links: [],
	mode: "",
	linksItemId: -1,
	
	//Get current web URL
	GetWebUrl: function () {
		if (!_spPageContextInfo)
			return '/';
		return _spPageContextInfo.webAbsoluteUrl.endsWith('/') ? _spPageContextInfo.webAbsoluteUrl : _spPageContextInfo.webAbsoluteUrl + '/';
	},
	
	createListItem: function(id,siteUrl,listName, itemProperties) {
	    var itemType = Shortcutswidget.getItemTypeForListName(listName);
	    itemProperties["__metadata"] = { "type": itemType };
		if( id == -1){	
		    return $.ajax({
		        url: siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
		        type: "POST",
		        contentType: "application/json;odata=verbose",
		        data: JSON.stringify(itemProperties),
		        headers: {
		            "Accept": "application/json;odata=verbose",
		            "X-RequestDigest": $("#__REQUESTDIGEST").val()
		        }
		    });
	    }
	    else{
		  return $.ajax({
		        url: siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items(" + id + ")",
		        type: "POST",
		        contentType: "application/json;odata=verbose",
		        data: JSON.stringify(itemProperties),
		        headers: {
		            "Accept": "application/json;odata=verbose",
		            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
		            "X-HTTP-Method": "MERGE",
	           		"If-Match": "*"
		        }
		    });
		}
	},

	// Get List Item Type metadata
	getItemTypeForListName: function(name) {
	    return "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "ListItem";
	},

	GetLinksFromServer: function () {
			var currentUserId = _spPageContextInfo.userId;
			var webUrl =  Shortcutswidget.GetWebUrl();
	
			$.ajax({
	            url: webUrl + "_api/web/lists/getbytitle('Customlistadditems')/items?$orderby=Created+desc&$Select=Author/Id,Title,Links,ID&$filter=Author/Id eq " + _spPageContextInfo.userId + "&$expand=Author",
	            type: 'GET',
	            headers: {
	                "Accept": "application/json;odata=verbose"
	            }
			}).then(function(data){
				if(data && data.d && data.d.results && data.d.results.length >0)
				{
					var links = data.d.results[0].Links;
					if(links && links.length > 0){
						Shortcutswidget.links = JSON.parse(links);
						Shortcutswidget.DisplayLinks();
					}
					if(data.d.results[0].ID)
						Shortcutswidget.linksItemId = data.d.results[0].ID;
				}
			});
	},
	
	DisplayLinks: function(){
		var resultHTML = "";
		//display links from 
		$("#sortable1").html("");
		for(var i = 0; i < Shortcutswidget.links.length; i++)
			resultHTML += Shortcutswidget.RenderLinkInWidget(Shortcutswidget.links[i].url, Shortcutswidget.links[i].title);
		$("#sortable1").append(resultHTML);
		Shortcutswidget.DisplayPinsInleftNavigation();			
	},
	
	UpdateLinksOnServer: function(){
		//specify item properties
		var itemProperties = {'Links':JSON.stringify(Shortcutswidget.links)};
		//create item
		Shortcutswidget.createListItem(Shortcutswidget.linksItemId,Shortcutswidget.GetWebUrl(),'Customlistadditems',itemProperties).then(function(data){
			if(data && data.d && data.d.ID)
				Shortcutswidget.linksItemId = data.d.ID;
		});		
	},	
	
	//Event on pin click in left navigation 
	AddNewLinkClick: function(element){
		//take link of element in left navigation
		var parentLink = $(element).parents("a");
		var title = parentLink.find(".menu-item-text").text();
		var url = parentLink.attr("href");
		var image = $(element).find(".left-nav-pin-img");
		if(!image.hasClass("fixed"))
		{
			image.addClass("fixed");
			//Add link to list 
			Shortcutswidget.AddNewLink(title,url);
		}
		else
		{
			Shortcutswidget.DeleteLink(null, title);
		}		
	},
	
	AddNewLink :function(title, url){
	    var elementHTML = Shortcutswidget.RenderLinkInWidget(url, title);
		$("#sortable1").append(elementHTML);	
		
		var newLinkObj = {};
		newLinkObj.url = url;
		newLinkObj.title = title;
		Shortcutswidget.links.push(newLinkObj);
		//save links on server 
		Shortcutswidget.UpdateLinksOnServer();
	},
	
	DeleteLink: function(element, title){
		//get title
		if(element){
			title = $(element).prev("a").text();
		}

		//removing from widget
		if(title){
			$(".shortcuts-link-element").each(function(index, element){
				if($(element).text() == title)
					$(element).parent().remove();
			});
		}
				
		//removing from array
		var newLinksArray= [];
		for(var i = 0; i< Shortcutswidget.links.length; i++)
		{
			if(Shortcutswidget.links[i].title != title){
				newLinksArray.push(Shortcutswidget.links[i]);
			}else{
				title = Shortcutswidget.links[i].title; 
				Shortcutswidget.UnpinInLeftNaviByTitle(title, false);
			}
		}
	
		Shortcutswidget.links = newLinksArray;
		
		//save links on server 
		Shortcutswidget.UpdateLinksOnServer();
	},
	
	RenderLinkInWidget: function (url,title){
		return "<li class='ui-state-default'>" +
					"<a class='shortcuts-link-element' target='_blank' href='" + url + "'>" + title + "</a>" + 
					"<a href='#' class='shortcuts-links-delete-img' style='float:right;" + (Shortcutswidget.mode == "edit" ? "block" : "none" ) + "' onclick='Shortcutswidget.DeleteLink(this,null)'></a>" +
				"</li>";
	},

	SwitchEditMode: function(){
		if(Shortcutswidget.mode == ""){
			
			$('#sortable1').sortable({
		         update: function(event, ui) {
			     	var newOrder = "";
			     	var newLinksArray = [];
			        $("#sortable1").find(".shortcuts-link-element").each(function(index,elem){
			        	var url = $(elem).attr("href");
			        	var title = $(elem).text();
			    		// change order in array
			     	   	for(var k = 0; k < Shortcutswidget.links.length; k++){
			        		if( Shortcutswidget.links[k].url == url && Shortcutswidget.links[k].title == title)
			        			newLinksArray.push(Shortcutswidget.links[k]);
			        	}		        	
			        });
			        Shortcutswidget.links = newLinksArray;
					Shortcutswidget.UpdateLinksOnServer();
	     		}
			});
			$('#sortable1').sortable('enable');
			$("#switchEditModeButton").val('Save');
			$(".shortcuts-links-delete-img").show();
			Shortcutswidget.mode = "edit";
		}
		else{
			Shortcutswidget.mode = "";
			
			$("#switchEditModeButton").val('Edit');
			$(".shortcuts-links-delete-img").hide();

			$("#sortable1").sortable('disable')	
		}
	},
	
	DisplayPinsInleftNavigation: function(){
		//display pins for existed links
		$(".shortcuts-link-element").each(function(index, element){
			var title = $(element).text();
			Shortcutswidget.UnpinInLeftNaviByTitle(title, true);
		});
	},
	
	UnpinInLeftNaviByTitle: function(title, isAdd){
		$("#sideNavBox").find("a.ms-core-listMenu-item").find(".menu-item-text").each(function(index1, leftNavElement){
			if($(leftNavElement).text() == title){
				var image = $(leftNavElement).parent().find(".left-nav-pin-img");
				if(isAdd)
					image.css("display","inline").addClass("fixed");
				else
					image.removeClass("fixed").css("display","none");
			}
		});
	}	
}

$(document).ready(function(){
	//Apply pin to left navigation
	$("#sideNavBox").find("li.dynamic .menu-item-text").after( "<a href='#' onclick='Shortcutswidget.AddNewLinkClick(this)'><img class='left-nav-pin-img' src=\""+Shortcutswidget.GetWebUrl() + "_catalogs/masterpage/csaa.sp.branding/images/pin_black.png\"></a>");
	
	$("#sideNavBox").find("a.ms-core-listMenu-item").hover(function() {
			$( this ).find(".left-nav-pin-img").css("display","inline");
		}, function() {
			var image = $( this ).find(".left-nav-pin-img");
			if(!image.hasClass("fixed")){
				$( this ).find(".left-nav-pin-img").css("display","none");	
			}
		}
	);
	
	Shortcutswidget.GetLinksFromServer();
});