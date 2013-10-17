<?php
/*!
	Wordpress crossdomain Web API for Javascript.
	Copyright (c) 2013 - Stephan Ahlf
*/

	require_once(dirname(__file__) . "/../../sa/connect/Deep_Connect_Wordpress.php");
 	require_once(ABSPATH . '/wp-includes/media.php');

	class request {

		private function get_images_from_media_library() {
		  $args = array(
		    'post_type' => 'attachment',
		    'post_mime_type' =>'image',
		    'post_status' => 'inherit',
		    'order'    => 'DESC'
		  );
		  $query_images = new WP_Query( $args );
		  $result =array();
		  foreach ($query_images->posts as $image) {
		  	$image->user = get_user_meta((int) $image->post_author);
		  	$result[] = $image;
		  }
		  return $result;
		}

  	    public function process() {
			Deep::$result->err = false;
			Deep::$result->images = $this->get_images_from_media_library();
  		}
	};

	$request = new request();
	Deep::get($request, "all");

?>