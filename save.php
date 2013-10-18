<?php
/*!
	Wordpress crossdomain Web API for Javascript.
	Copyright (c) 2013 - Stephan Ahlf
*/

	require_once(dirname(__file__) . "/../../sa/connect/Deep_Connect_Wordpress.php");

	class request {

		private function addAttachment($filename){
			$user = wp_get_current_user();
			$wp_filetype = wp_check_filetype(basename($filename), null );
			$wp_upload_dir = wp_upload_dir();
			$attachment = array(
				'guid' => $wp_upload_dir['url'] . '/' . basename( $filename ),
				'post_mime_type' => $wp_filetype['type'],
				'post_title' => Deep::getParm("theme-name"),
				'post_content' => '',
				'post_author' => $user->ID,
				'post_status' => 'publish',
				//'tax_input' => array( 'taxonomy_name' => array( 'theme', 'term2', 'term3' ) )
				'tags_input' => 'theme'
			);
			$attach_id = @wp_insert_attachment( $attachment, $filename );
			$cat_ids = array( 28 );
			wp_set_object_terms( $attach_id, $cat_ids, 'category' );
			// you must first include the image.php file
			// for the function wp_generate_attachment_metadata() to work
			require_once(ABSPATH . 'wp-admin/includes/image.php');
			$attach_data = wp_generate_attachment_metadata( $attach_id, $filename );
			wp_update_attachment_metadata( $attach_id, $attach_data );
			return get_post( $attach_id );

		}

  	    public function process() {
  	    	global $wp_upload_dir;
			$data = Deep::getParm("image-preview-data");

			$name = sanitize_title(Deep::getParm("theme-name"));
			$data = substr($data, strpos($data, ",") + 1);
			$wp_upload_dir = wp_upload_dir();
			$filename = $wp_upload_dir['path'] . '/' . basename( $name ) . ".png";

			if (!is_file($filename)){
				$fp = fopen( $filename, 'wb');
				fwrite($fp, base64_decode($data));
				fclose($fp);

				$attachment = $this->addAttachment($filename);

				Deep::$result->err = false;
				Deep::$result->target = "#theme-roller/share/" . $attachment->post_name . ":/" . $attachment->post_title . ":";
				Deep::$result->themeName = $attachment->post_name;
				Deep::$result->themeName = $attachment->post_title;
			} else {
				Deep::$result->msg = Deep::getParm("theme-name") . " already exists";
			}
  		}
	};

	$request = new request();
	Deep::get($request, ["administrator", "subscriber"]);

?>