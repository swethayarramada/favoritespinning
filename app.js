$(document).ready(function() {

	
	// initialize Shortcut widget
	
    // navigation and tabs
    $('.nav-icon,.overlay').click(function() {
        $('body').toggleClass('open');
        $('.nav-icon').toggleClass('open');
    });
    
    $('.bite_block').clone().appendTo('.work_down');
    $('.header_tab').clone().appendTo('.head_main');

        $('.header_tab ul li a').click(function(e){
        var tar = '.'+$(this).attr('id');
        $(tar).toggleClass('showpopup');
        $(tar).siblings().removeClass('showpopup');
        //$('body').addClass('open_class');
        $(this).toggleClass('active');
        $(this).parent().siblings().find('a').removeClass('active');
    }); 
    
    // global navigation
    $('nav > ul > li > a').click(function(e){
        
        $(this).parent().addClass('active');
        $(this).parent().siblings().removeClass('active');
        
        if( $(window).width() < 768  )
        {
            $(this).parent().find('.drop_down').slideToggle();
            $(this).parent().siblings().find('.drop_down').slideUp();
            
            }
        
        });
        
                
    // global navigation item click
    $('.drop_down_main a').click(function(e) {
        $(this).closest('.drop_down').hide();
        $(this).closest('li').removeClass('active');
    });
    
    /* get all user profile properties from SharePoint 
     * and cache them for later retrieval
     * Then populate each profile DOM Element with values
    */
    setupUserProfile();
    
    
    // get user profile
	//getUserProfile("#profile_fullname", "DisplayName");

    //for  edit options 
    
     var edt = false;
    
    $('.btn_edit').click(function(e) {
        
        if(edt == false)
        {
            
        $('.short_block .employee_main_in ul li').each(function(index, element) {
            $(this).find('input').removeAttr(' disabled');
            $(this).prepend('<span class="btn_tgl"'+'></span>')
           // $(this).append('<span class="btn_remove"'+'></span>')
            
        });
        
            $('.short_block').addClass('edit_mode')
            edt = true;
        
        }
        else
        {
            
            $('.short_block .employee_main_in ul li').each(function(index, element) {
            $(this).find('input').attr(' disabled',' disabled');
            $(this).find('.btn_tgl').remove();
            $(this).find('.btn_remove').remove();
            
        });
        
            $('.short_block').removeClass('edit_mode')
            edt = false;
            
        }
    });
    
    $(document).on('click','.btn_remove',function(e){                 
        $(this).closest('li').remove();
        
    });
        
      $("#sideNavBox").find("ul.root > li.static > a").hover(function() {
        $("#sideNavBox").find("ul.root > li.static > ul.static").css("display","none");
    	$( this ).parent().find("ul.static").css("display","inline");

});

$('li.static.dynamic-children').hover(function () {
$( this ).find("ul.dynamic").css("left", "0px");

});
      
            
    

});