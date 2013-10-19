<?php
/*!
	Wordpress crossdomain Web API for Javascript.
	Copyright (c) 2013 - Stephan Ahlf
*/

	require_once(dirname(__file__) . "/../../sa/connect/Deep_Connect_Wordpress.php");
 	require_once(ABSPATH . '/wp-includes/media.php');

	class request {


		private function get_images_from_media_library() {
			global $post;
	  		$args = array(
				'post_type' => 'attachment',
				'numberposts' => -1,
				'orderly' => 'menu_order',
				'post_mime_type' => 'image',
				'meta_key' => 'theme',
    			'meta_value' => '1'
		  	);
			$query = Deep::getParm("q", true);
			if ($query !== null && trim($query) !== "") $args["s"] = trim($query);

			$query_images = get_children( $args );
			$result = array();

			foreach ($query_images as $image){
				$user = get_user_meta((int) $image->post_author);
				$image->user = $user["nickname"];
				$thumb = wp_get_attachment_image_src( $image->ID, 'thumbnail_size' );
				$image->thumbnailUrl = $thumb['0'];
				$result[] = $image;
			}
			return $result;
		}

  	    public function process() {
			Deep::$result->err = false;
			$imageList = $this->get_images_from_media_library();
			Deep::$result->images = $imageList;
  		}
	};

	$request = new request();
	Deep::get($request, "all");

?>